// src/services/translatorSpanishBotService.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const { transcribeAudio } = require('./whisperService');
const { translateText } = require('./translationService');
const { speakText } = require('./textToSpeechService');

const tmpDir = path.join(__dirname, '../../tmp');
fs.mkdirSync(tmpDir, { recursive: true });

const token = process.env.ES_RU_TRANSLATOR
const bot = new TelegramBot(token, { polling: true });

const userSettings = new Map();

function getUserSettings(chatId) {
  if (!userSettings.has(chatId)) {
    userSettings.set(chatId, { direction: 'es-ru', lastTranslation: null });
  }
  return userSettings.get(chatId);
}

function getLanguageCodes(settings) {
  return settings.direction === 'es-ru'
    ? { source: 'es', target: 'ru' }
    : { source: 'ru', target: 'es' };
}

function getLanguageEmoji(settings) {
  return settings.direction === 'es-ru'
    ? { source: '🇪🇸', target: '🇷🇺' }
    : { source: '🇷🇺', target: '🇪🇸' };
}

setInterval(() => {
  fs.readdir(tmpDir, (err, files) => {
    if (err) return;
    files.forEach(file => {
      const filePath = path.join(tmpDir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) return;
        if (Date.now() - stats.mtimeMs > 10 * 60 * 1000) {
          fs.unlink(filePath, () => {});
        }
      });
    });
  });
}, 5 * 60 * 1000);

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const settings = getUserSettings(chatId);
  const emoji = getLanguageEmoji(settings);

  bot.sendMessage(chatId,
    `👋 ¡Hola! Soy un bot traductor 🇪×🇷\n\n` +
    `Modo actual: ${emoji.source} → ${emoji.target}\n\n` +
    `Comandos:\n` +
    `/translate <texto>\n/speak <texto>\n/switch\n/mode\n\n` +
    `También puedes enviar mensajes de voz.`
  );
});

bot.onText(/\/switch/, (msg) => {
  const settings = getUserSettings(msg.chat.id);
  settings.direction = settings.direction === 'es-ru' ? 'ru-es' : 'es-ru';
  const emoji = getLanguageEmoji(settings);
  bot.sendMessage(msg.chat.id, `🔁 Modo cambiado: ${emoji.source} → ${emoji.target}`);
});

bot.onText(/\/mode/, (msg) => {
  const settings = getUserSettings(msg.chat.id);
  const emoji = getLanguageEmoji(settings);
  const langs = getLanguageCodes(settings);
  bot.sendMessage(msg.chat.id,
    `Modo de traducción actual:\n${emoji.source} → ${emoji.target}\n(${langs.source} → ${langs.target})`
  );
});

bot.onText(/\/translate (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const text = match[1];
  const settings = getUserSettings(chatId);
  const langs = getLanguageCodes(settings);
  const emoji = getLanguageEmoji(settings);

  try {
    const translated = await translateText(text, langs.target, langs.source);
    settings.lastTranslation = translated;
    bot.sendMessage(chatId,
      `${emoji.source} "${text}"\n\n${emoji.target} "${translated}"`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              { text: "🔊 Reproducir", callback_data: `speak_${chatId}` },
              { text: "🔁 Cambiar idioma", callback_data: `switch_${chatId}` }
            ]
          ]
        }
      }
    );
  } catch (e) {
    console.error('Translation error:', e);
    bot.sendMessage(chatId, '⚠️ Error al traducir el texto');
  }
});

bot.onText(/\/speak (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const text = match[1];
  const settings = getUserSettings(chatId);
  const langs = getLanguageCodes(settings);

  try {
    const audioPath = await speakText(text, langs.source);
    await bot.sendAudio(chatId, audioPath, {
      caption: `🔊 Voz en ${langs.source === 'es' ? 'español' : 'ruso'}`
    });
  } catch (e) {
    console.error('Speak error:', e);
    bot.sendMessage(chatId, '⚠️ Error al generar la voz');
  }
});

bot.on('voice', async (msg) => {
  const chatId = msg.chat.id;
  const fileId = msg.voice.file_id;
  const settings = getUserSettings(chatId);
  const langs = getLanguageCodes(settings);
  const emoji = getLanguageEmoji(settings);

  try {
    const fileName = await bot.downloadFile(fileId, tmpDir);
    const transcript = await transcribeAudio(fileName, langs.source);
    const translated = await translateText(transcript, langs.target, langs.source);
    const audioPath = await speakText(translated, langs.target);

    settings.lastTranslation = translated;

    await bot.sendMessage(chatId,
      `${emoji.source} "${transcript}"\n\n${emoji.target} "${translated}"`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              { text: "🔊 Reproducir", callback_data: `speak_${chatId}` },
              { text: "🔁 Cambiar idioma", callback_data: `switch_${chatId}` }
            ]
          ]
        }
      }
    );

    await bot.sendAudio(chatId, audioPath, {
      caption: `🔊 Voz en ${langs.target === 'es' ? 'español' : 'ruso'}`
    });
  } catch (e) {
    console.error('Voice processing error:', e);
    bot.sendMessage(chatId, '⚠️ Error al procesar el mensaje de voz');
  }
});

bot.on('text', async (msg) => {
  if (msg.text.startsWith('/')) return;

  const chatId = msg.chat.id;
  const settings = getUserSettings(chatId);
  const langs = getLanguageCodes(settings);
  const emoji = getLanguageEmoji(settings);

  try {
    const translated = await translateText(msg.text, langs.target, langs.source);
    settings.lastTranslation = translated;
    bot.sendMessage(chatId, `${emoji.target} ${translated}`);
  } catch (e) {
    console.error('Text translation error:', e);
    bot.sendMessage(chatId, '⚠️ Error al traducir texto');
  }
});

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const settings = getUserSettings(chatId);
  const langs = getLanguageCodes(settings);

  if (query.data.startsWith('speak_')) {
    const text = settings.lastTranslation;
    if (!text) return bot.answerCallbackQuery(query.id, { text: 'No hay texto para reproducir' });

    try {
      const audioPath = await speakText(text, langs.target);
      await bot.sendAudio(chatId, audioPath, {
        caption: `🔊 Voz en ${langs.target === 'es' ? 'español' : 'ruso'}`
      });
    } catch (e) {
      console.error('Speak callback error:', e);
      bot.sendMessage(chatId, '⚠️ Error durante la síntesis de voz');
    }
  }

  if (query.data.startsWith('switch_')) {
    settings.direction = settings.direction === 'es-ru' ? 'ru-es' : 'es-ru';
    const emoji = getLanguageEmoji(settings);
    bot.answerCallbackQuery(query.id, { text: `Idiomas cambiados: ${emoji.source} → ${emoji.target}` });
    bot.sendMessage(chatId, `🔁 Ahora traduciendo: ${emoji.source} → ${emoji.target}`);
  }
});

console.log('[BOT] Spanish translator launched');

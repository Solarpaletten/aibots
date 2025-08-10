// src/services/translatorLatvianBotService.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const { transcribeAudio } = require('./whisperService');
const { translateText } = require('./translationService');
const { speakText } = require('./textToSpeechService');

const tmpDir = path.join(__dirname, '../../tmp');
fs.mkdirSync(tmpDir, { recursive: true });

const token = process.env.LV_RU_TRANSLATOR
const bot = new TelegramBot(token, { polling: true });

const userSettings = new Map();

function getUserSettings(chatId) {
  if (!userSettings.has(chatId)) {
    userSettings.set(chatId, { direction: 'lv-ru', lastTranslation: null });
  }
  return userSettings.get(chatId);
}

function getLanguageCodes(settings) {
  return settings.direction === 'lv-ru'
    ? { source: 'lv', target: 'ru' }
    : { source: 'ru', target: 'lv' };
}

function getLanguageEmoji(settings) {
  return settings.direction === 'lv-ru'
    ? { source: '🇱🇻', target: '🇷🇺' }
    : { source: '🇷🇺', target: '🇱🇻' };
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
    `👋 Sveiki! Esmu tulkošanas bots 🇱🇻⇄🇷🇺\n\n` +
    `Aktīvāis režīms: ${emoji.source} → ${emoji.target}\n\n` +
    `Komandas:\n` +
    `/translate <teksts>\n/speak <teksts>\n/switch\n/mode\n\n` +
    `Varat arī sūtīt balss ziņas.`
  );
});

bot.onText(/\/switch/, (msg) => {
  const settings = getUserSettings(msg.chat.id);
  settings.direction = settings.direction === 'lv-ru' ? 'ru-lv' : 'lv-ru';
  const emoji = getLanguageEmoji(settings);
  bot.sendMessage(msg.chat.id, `🔁 Režīms mainīts: ${emoji.source} → ${emoji.target}`);
});

bot.onText(/\/mode/, (msg) => {
  const settings = getUserSettings(msg.chat.id);
  const emoji = getLanguageEmoji(settings);
  const langs = getLanguageCodes(settings);
  bot.sendMessage(msg.chat.id,
    `Pašreizējais tulkošanas režīms:\n${emoji.source} → ${emoji.target}\n(${langs.source} → ${langs.target})`
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
              { text: "🔊 Izrunāt", callback_data: `speak_${chatId}` },
              { text: "🔁 Mainīt valodu", callback_data: `switch_${chatId}` }
            ]
          ]
        }
      }
    );
  } catch (e) {
    console.error('Tulkošanas kļūda:', e);
    bot.sendMessage(chatId, '⚠️ Kļūda tulkojot tekstu');
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
      caption: `🔊 Valodā: ${langs.source}`
    });
  } catch (e) {
    console.error('Runas sintezēšanas kļūda:', e);
    bot.sendMessage(chatId, '⚠️ Kļūda sintezējot runu');
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
              { text: "🔊 Izrunāt", callback_data: `speak_${chatId}` },
              { text: "🔁 Mainīt valodu", callback_data: `switch_${chatId}` }
            ]
          ]
        }
      }
    );

    await bot.sendAudio(chatId, audioPath, {
      caption: `🔊 Valodā: ${langs.target}`
    });
  } catch (e) {
    console.error('Balss ziņas apstrādes kļūda:', e);
    bot.sendMessage(chatId, '⚠️ Kļūda apstrādājot balss ziņu');
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
    console.error('Kļūda tulkojot tekstu:', e);
    bot.sendMessage(chatId, '⚠️ Kļūda tulkojot tekstu');
  }
});

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const settings = getUserSettings(chatId);
  const langs = getLanguageCodes(settings);

  if (query.data.startsWith('speak_')) {
    const text = settings.lastTranslation;
    if (!text) return bot.answerCallbackQuery(query.id, { text: 'Nav teksta' });

    try {
      const audioPath = await speakText(text, langs.target);
      await bot.sendAudio(chatId, audioPath, {
        caption: `🔊 Valodā: ${langs.target}`
      });
    } catch (e) {
      console.error('Izrunas kļūda:', e);
      bot.sendMessage(chatId, '⚠️ Kļūda sintezējot runu');
    }
  }

  if (query.data.startsWith('switch_')) {
    settings.direction = settings.direction === 'lv-ru' ? 'ru-lv' : 'lv-ru';
    const emoji = getLanguageEmoji(settings);
    bot.answerCallbackQuery(query.id, { text: `Režīms mainīts: ${emoji.source} → ${emoji.target}` });
    bot.sendMessage(chatId, `🔁 Tagad tulkojam: ${emoji.source} → ${emoji.target}`);
  }
});

console.log('[BOT] Latvian translator launched');

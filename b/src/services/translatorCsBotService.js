// src/services/translatorCzechBotService.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const { transcribeAudio } = require('./whisperService');
const { translateText } = require('./translationService');
const { speakText } = require('./textToSpeechService');

const tmpDir = path.join(__dirname, '../../tmp');
fs.mkdirSync(tmpDir, { recursive: true });

const token = process.env.CS_RU_TRANSLATOR
const bot = new TelegramBot(token, { polling: true });

const userSettings = new Map(); // chatId -> { direction: 'cs-ru' | 'ru-cs', lastTranslation: string }

function getUserSettings(chatId) {
  if (!userSettings.has(chatId)) {
    userSettings.set(chatId, { direction: 'cs-ru', lastTranslation: null });
  }
  return userSettings.get(chatId);
}

function getLanguageCodes(settings) {
  return settings.direction === 'cs-ru'
    ? { source: 'cs', target: 'ru' }
    : { source: 'ru', target: 'cs' };
}

function getLanguageEmoji(settings) {
  return settings.direction === 'cs-ru'
    ? { source: '🇨🇿', target: '🇷🇺' }
    : { source: '🇷🇺', target: '🇨🇿' };
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
    `👋 Привет! Я бот-переводчик 🇨🇿⇄🇷🇺\n\n` +
    `Текущий режим: ${emoji.source} → ${emoji.target}\n\n` +
    `Команды:\n` +
    `/translate <текст>\n/speak <текст>\n/switch\n/mode\n\n` +
    `Можно отправлять голосовые сообщения.`
  );
});

bot.onText(/\/switch/, (msg) => {
  const settings = getUserSettings(msg.chat.id);
  settings.direction = settings.direction === 'cs-ru' ? 'ru-cs' : 'cs-ru';
  const emoji = getLanguageEmoji(settings);
  bot.sendMessage(msg.chat.id, `🔁 Режим переключён: ${emoji.source} → ${emoji.target}`);
});

bot.onText(/\/mode/, (msg) => {
  const settings = getUserSettings(msg.chat.id);
  const emoji = getLanguageEmoji(settings);
  const langs = getLanguageCodes(settings);
  bot.sendMessage(msg.chat.id,
    `Текущий режим перевода:\n${emoji.source} → ${emoji.target}\n(${langs.source} → ${langs.target})`
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
              { text: "🔊 Озвучить перевод", callback_data: `speak_${chatId}` },
              { text: "🔁 Сменить язык", callback_data: `switch_${chatId}` }
            ]
          ]
        }
      }
    );
  } catch (e) {
    console.error(e);
    bot.sendMessage(chatId, '⚠️ Ошибка при переводе текста');
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
      caption: `🔊 Озвучка на ${langs.source === 'cs' ? 'чешском' : 'русском'} языке`
    });
  } catch (e) {
    console.error(e);
    bot.sendMessage(chatId, '⚠️ Ошибка при озвучивании');
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
              { text: "🔊 Озвучить перевод", callback_data: `speak_${chatId}` },
              { text: "🔁 Сменить язык", callback_data: `switch_${chatId}` }
            ]
          ]
        }
      }
    );

    await bot.sendAudio(chatId, audioPath, {
      caption: `🔊 Озвучка на ${langs.target === 'cs' ? 'чешском' : 'русском'} языке`
    });
  } catch (e) {
    console.error(e);
    bot.sendMessage(chatId, '⚠️ Ошибка при обработке голосового сообщения');
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
    console.error(e);
    bot.sendMessage(chatId, '⚠️ Ошибка при переводе текста');
  }
});

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const settings = getUserSettings(chatId);
  const langs = getLanguageCodes(settings);

  if (query.data.startsWith('speak_')) {
    const text = settings.lastTranslation;
    if (!text) return bot.answerCallbackQuery(query.id, { text: 'Нет текста для озвучки' });

    const audioPath = await speakText(text, langs.target);
    await bot.sendAudio(chatId, audioPath, {
      caption: `🔊 Озвучка перевода на ${langs.target === 'cs' ? 'чешском' : 'русском'} языке`
    });
  }

  if (query.data.startsWith('switch_')) {
    settings.direction = settings.direction === 'cs-ru' ? 'ru-cs' : 'cs-ru';
    const emoji = getLanguageEmoji(settings);
    bot.answerCallbackQuery(query.id, { text: `Языки переключены: ${emoji.source} → ${emoji.target}` });
    bot.sendMessage(chatId, `🔁 Перевод теперь ${emoji.source} → ${emoji.target}`);
  }
});

console.log('[BOT] Чешский переводчик запущен');

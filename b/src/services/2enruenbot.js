// src/services/translatorRuEnBotService.js - Русско-английский переводчик
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const { transcribeAudio } = require('./whisperService');
const { translateText } = require('./translationService');
const { speakText } = require('./textToSpeechService');

// Создаем tmp директорию для временных файлов
const tmpDir = path.join(__dirname, '../../tmp');
fs.mkdirSync(tmpDir, { recursive: true });

// Используем токен для RU-EN бота
const token = process.env.RU_EN_TRANSLATOR;
const bot = new TelegramBot(token, { polling: true });

// Обработка ошибок, чтобы бот не падал
bot.on('polling_error', (error) => {
  console.log('Polling error:', error.message);
});

// Настройка направления перевода - фиксированная для русско-английского
const DIRECTION = 'ru-en';
const SOURCE_LANG = 'ru';
const TARGET_LANG = 'en';
const SOURCE_EMOJI = '🇷🇺';
const TARGET_EMOJI = '🇬🇧';

// Хранение последних переводов
const userTranslations = new Map(); // chatId -> { lastTranslation, originalText }

function getUserTranslations(chatId) {
  if (!userTranslations.has(chatId)) {
    userTranslations.set(chatId, { lastTranslation: null, originalText: null });
  }
  return userTranslations.get(chatId);
}

// Очистка временных файлов
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

// /start команда
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId,
    `👋 Привет! Я русско-английский переводчик ${SOURCE_EMOJI}→${TARGET_EMOJI}\n\n` +
    `Просто отправьте мне текст на русском языке, и я переведу его на английский.\n` +
    `Вы также можете отправить голосовое сообщение.`
  );
});

// /help команда
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  
  bot.sendMessage(chatId, 
    `📖 *Русско-английский переводчик*\n\n` +
    `*Как использовать:*\n` +
    `- Просто отправьте текст на русском языке\n` +
    `- Для перевода голоса отправьте голосовое сообщение\n` +
    `- Нажмите кнопку 🔊, чтобы прослушать текст\n\n` +
    `*Направление перевода:*\n` +
    `${SOURCE_EMOJI} Русский → ${TARGET_EMOJI} Английский`,
    {
      parse_mode: 'Markdown'
    }
  );
});

// Обработка голосовых сообщений
bot.on('voice', async (msg) => {
  const chatId = msg.chat.id;
  const fileId = msg.voice.file_id;
  const userTranslation = getUserTranslations(chatId);

  try {
    // Скачиваем и обрабатываем файл без уведомлений
    const fileName = await bot.downloadFile(fileId, tmpDir);
    console.log('Скачан файл:', fileName);
    
    const transcript = await transcribeAudio(fileName, SOURCE_LANG);
    console.log('Распознанный текст:', transcript);
    
    const translated = await translateText(transcript, TARGET_LANG, SOURCE_LANG);
    console.log('Переведенный текст:', translated);
    
    // Сохраняем текст для повторного использования
    userTranslation.lastTranslation = translated;
    userTranslation.originalText = transcript;
    
    // Отправляем результат перевода
    await bot.sendMessage(chatId,
      `${SOURCE_EMOJI} "${transcript}"\n\n${TARGET_EMOJI} "${translated}"`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              { text: "🔊 RU", callback_data: "speak_original" },
              { text: "🔊 EN", callback_data: "speak_translation" }
            ]
          ]
        }
      }
    );
  } catch (e) {
    console.error('Ошибка при обработке голосового:', e);
    bot.sendMessage(chatId, '⚠️ Ошибка при обработке голосового сообщения');
  }
});

// Обработка текстовых сообщений
bot.on('text', async (msg) => {
  // Игнорируем команды
  if (msg.text.startsWith('/')) return;

  const chatId = msg.chat.id;
  const userTranslation = getUserTranslations(chatId);

  try {
    // Переводим текст
    const translated = await translateText(msg.text, TARGET_LANG, SOURCE_LANG);
    
    // Сохраняем для повторного использования
    userTranslation.lastTranslation = translated;
    userTranslation.originalText = msg.text;
    
    // Отправляем результат с кнопками
    bot.sendMessage(chatId,
      `${SOURCE_EMOJI} "${msg.text}"\n\n${TARGET_EMOJI} "${translated}"`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              { text: "🔊 RU", callback_data: "speak_original" },
              { text: "🔊 EN", callback_data: "speak_translation" }
            ]
          ]
        }
      }
    );
  } catch (e) {
    console.error('Ошибка при переводе текста:', e);
    bot.sendMessage(chatId, '⚠️ Ошибка при переводе текста');
  }
});

// Обработка нажатий на кнопки
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const messageId = query.message.message_id;
  const userTranslation = getUserTranslations(chatId);
  
  console.log('Получен callback_query:', query.data);

  // Обработка кнопки озвучки оригинала (русский)
  if (query.data === "speak_original") {
    const text = userTranslation.originalText;
    if (!text) {
      try {
        await bot.answerCallbackQuery(query.id, { text: 'Нет текста для озвучки' });
      } catch (e) {
        console.error('Ошибка при ответе на callback:', e.message);
      }
      return;
    }

    try {
      // Отвечаем на колбэк
      try {
        await bot.answerCallbackQuery(query.id);
      } catch (e) {
        console.error('Ошибка при ответе на callback:', e.message);
      }
      
      // Сразу создаем аудио без сообщений ожидания
      const audioPath = await speakText(text, SOURCE_LANG);
      
      await bot.sendAudio(chatId, audioPath, {
        caption: `🔊 Русский: "${text}"`,
        reply_to_message_id: messageId
      });
    } catch (e) {
      console.error('Ошибка при озвучивании оригинала:', e);
      try {
        await bot.answerCallbackQuery(query.id, { text: 'Ошибка при озвучивании' });
      } catch (err) {
        console.error('Ошибка при ответе на callback:', err.message);
      }
    }
    return;
  }

  // Обработка кнопки озвучки перевода (английский)
  if (query.data === "speak_translation") {
    const text = userTranslation.lastTranslation;
    if (!text) {
      try {
        await bot.answerCallbackQuery(query.id, { text: 'Нет текста для озвучки' });
      } catch (e) {
        console.error('Ошибка при ответе на callback:', e.message);
      }
      return;
    }

    try {
      // Отвечаем на колбэк
      try {
        await bot.answerCallbackQuery(query.id);
      } catch (e) {
        console.error('Ошибка при ответе на callback:', e.message);
      }
      
      // Сразу создаем аудио без сообщений ожидания
      const audioPath = await speakText(text, TARGET_LANG);
      
      await bot.sendAudio(chatId, audioPath, {
        caption: `🔊 English: "${text}"`,
        reply_to_message_id: messageId
      });
    } catch (e) {
      console.error('Ошибка при озвучивании перевода:', e);
      try {
        await bot.answerCallbackQuery(query.id, { text: 'Ошибка при озвучивании' });
      } catch (err) {
        console.error('Ошибка при ответе на callback:', err.message);
      }
    }
    return;
  }
});

console.log('[BOT] Русско-английский переводчик запущен (RU→EN)');

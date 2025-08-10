// src/services/derudebot.js - Русский-немецкий переводчик
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const { transcribeAudio } = require('../../../f/whisperService');
const { translateText } = require('./translationService');
const { speakText } = require('../../../f/textToSpeechService');

// Создаем tmp директорию для временных файлов
const tmpDir = path.join(__dirname, '../../tmp');
fs.mkdirSync(tmpDir, { recursive: true });

// Используем правильный токен для ru-de бота
const token = process.env.RU_DE_TRANSLATOR;
const bot = new TelegramBot(token, { polling: true });

// Обработка ошибок, чтобы бот не падал
bot.on('polling_error', (error) => {
  console.log('Polling error:', error.message);
});

// Настройка направления перевода - фиксированная для немецко-русского
const DIRECTION = 'ru-de';
const SOURCE_LANG = 'ru';
const TARGET_LANG = 'de';

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

// Команда /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const welcomeMessage = `🇩🇪➡️🇷🇺 Добро пожаловать в немецко-русский переводчик!

Отправьте:
• Текст на немецком языке для перевода
• Голосовое сообщение на немецком языке
• /help для справки`;
  
  bot.sendMessage(chatId, welcomeMessage);
});

// Команда /help
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const helpMessage = `��🇪➡️🇷🇺 Помощь по использованию:

📝 **Текстовый перевод:**
Просто отправьте текст на немецком языке

🎤 **Голосовой перевод:**
Отправьте голосовое сообщение на немецком языке

⚡ **Быстрые команды:**
/start - Начать работу
/help - Показать эту справку

🔄 **Направление перевода:** Немецкий → Русский`;
  
  bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
});

// Обработка текстовых сообщений
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  
  // Пропускаем команды
  if (text && text.startsWith('/')) return;
  
  // Пропускаем пустые сообщения
  if (!text || text.trim() === '') return;
  
  try {
    console.log(`Получен текст для перевода: ${text}`);
    
    // Переводим текст
    const translatedText = await translateText(text, SOURCE_LANG, TARGET_LANG);
    
    // Сохраняем перевод
    const userTrans = getUserTranslations(chatId);
    userTrans.lastTranslation = translatedText;
    userTrans.originalText = text;
    
    console.log(`Переведенный текст: ${translatedText}`);
    
    // Отправляем перевод
    const response = `🇩🇪➡️🇷🇺\n\n**Оригинал:** ${text}\n**Перевод:** ${translatedText}`;
    await bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });
    
    // Генерируем голос для перевода
    try {
      const audioPath = await speakText(translatedText, TARGET_LANG);
      if (audioPath && fs.existsSync(audioPath)) {
        await bot.sendVoice(chatId, audioPath);
        // Удаляем файл после отправки
        setTimeout(() => {
          fs.unlink(audioPath, () => {});
        }, 5000);
      }
    } catch (voiceError) {
      console.error('Ошибка генерации голоса:', voiceError.message);
    }
    
  } catch (error) {
    console.error('Ошибка перевода:', error.message);
    bot.sendMessage(chatId, '❌ Произошла ошибка при переводе. Попробуйте еще раз.');
  }
});

// Обработка голосовых сообщений
bot.on('voice', async (msg) => {
  const chatId = msg.chat.id;
  const voice = msg.voice;
  
  try {
    console.log('Получено голосовое сообщение');
    
    // Уведомляем о начале обработки
    await bot.sendMessage(chatId, '🎤 Обрабатываю голосовое сообщение...');
    
    // Получаем файл
    const fileId = voice.file_id;
    const fileInfo = await bot.getFile(fileId);
    const fileUrl = `https://api.telegram.org/file/bot${token}/${fileInfo.file_path}`;
    
    // Сохраняем файл
    const fileName = `voice_${Date.now()}.oga`;
    const filePath = path.join(tmpDir, fileName);
    
    const response = await fetch(fileUrl);
    const buffer = await response.buffer();
    fs.writeFileSync(filePath, buffer);
    
    console.log(`Скачан файл: ${filePath}`);
    
    // Распознаем речь
    const transcribedText = await transcribeAudio(filePath);
    console.log(`Распознанный текст: ${transcribedText}`);
    
    if (!transcribedText || transcribedText.trim() === '') {
      await bot.sendMessage(chatId, '❌ Не удалось распознать речь. Попробуйте еще раз.');
      return;
    }
    
    // Переводим текст
    const translatedText = await translateText(transcribedText, SOURCE_LANG, TARGET_LANG);
    console.log(`Переведенный текст: ${translatedText}`);
    
    // Сохраняем перевод
    const userTrans = getUserTranslations(chatId);
    userTrans.lastTranslation = translatedText;
    userTrans.originalText = transcribedText;
    
    // Отправляем результат
    const responseMessage = `🎤🇩🇪➡️🇷🇺\n\n**Распознано:** ${transcribedText}\n**Перевод:** ${translatedText}`;
    await bot.sendMessage(chatId, responseMessage, { parse_mode: 'Markdown' });
    
    // Генерируем голос для перевода
    try {
      const audioPath = await speakText(translatedText, TARGET_LANG);
      if (audioPath && fs.existsSync(audioPath)) {
        await bot.sendVoice(chatId, audioPath);
        // Удаляем файл после отправки
        setTimeout(() => {
          fs.unlink(audioPath, () => {});
        }, 5000);
      }
    } catch (voiceError) {
      console.error('Ошибка генерации голоса:', voiceError.message);
    }
    
    // Удаляем временный файл
    fs.unlink(filePath, () => {});
    
  } catch (error) {
    console.error('Ошибка обработки голоса:', error.message);
    bot.sendMessage(chatId, '❌ Произошла ошибка при обработке голосового сообщения.');
  }
});

console.log('[BOT] Русско-немецкий переводчик запущен');

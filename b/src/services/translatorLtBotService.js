// src/services/translatorLithuanianBotService.js
const logger = require('./utils/logger');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const { transcribeAudio } = require('./whisperService');
const { translateText, detectLanguage } = require('./translationService');
const { speakText } = require('./textToSpeechService');
const audioSplitter = require('./utils/audioSplitter');

const tmpDir = path.join(__dirname, '../../tmp');
fs.mkdirSync(tmpDir, { recursive: true });

const token = process.env.LT_RU_TRANSLATOR;
if (!token) {
  console.error('TELEGRAM_LT_BOT token not found in environment variables!');
  logger.error('Bot token not found', {
    error: 'TELEGRAM_LT_BOT environment variable is missing',
    path: path.resolve(__dirname, '.env')
  });
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

const userSettings = new Map();

function getUserSettings(chatId) {
  if (!userSettings.has(chatId)) {
    userSettings.set(chatId, { 
      direction: 'auto',
      lastTranslation: null,
      lastSource: null 
    });
    
    // Логируем новых пользователей
    logger.userActivity({
      userId: chatId,
      command: 'new_user',
      messageType: 'system'
    });
  }
  return userSettings.get(chatId);
}

// Вспомогательная функция для получения эмодзи флага по коду языка
function getLanguageFlag(langCode) {
  return langCode === 'lt' ? '🇱🇹' : '🇷🇺';
}

async function getTranslationDirection(text, userDirection = 'auto') {
  console.log('🔍 getTranslationDirection вызвана с:', { text: text.substring(0, 50), userDirection });
  
  // Если пользователь зафиксировал направление - используем его
  if (userDirection !== 'auto') {
    const result = userDirection === 'lt-ru' 
      ? { source: 'lt', target: 'ru' }
      : { source: 'ru', target: 'lt' };
    console.log('📌 Ручной режим, результат:', result);
    return result;
  }

  try {
    // УЛУЧШЕННАЯ ЛОГИКА определения языка
    
    // 1. Расширенная проверка литовских символов (добавлены заглавные)
    const hasLithuanianChars = /[ąčęėįšųūžĄČĘĖĮŠŲŪŽ]/i.test(text);
    
    // 2. Проверка кириллицы (включая ё и заглавные)
    const hasCyrillicChars = /[а-яёА-ЯЁ]/i.test(text);
    
    // 3. Проверка на обычные латинские буквы
    const hasBasicLatin = /[a-zA-Z]/.test(text);
    
    console.log('🔤 Детальный анализ символов:', {
      hasLithuanianChars,
      hasCyrillicChars,
      hasBasicLatin,
      textLength: text.length,
      firstChars: text.substring(0, 10)
    });
    
    let result;
    
    // ПРИОРИТЕТНАЯ ЛОГИКА:
    
    // 1. Если есть литовские символы и НЕТ кириллицы - однозначно литовский
    if (hasLithuanianChars && !hasCyrillicChars) {
      result = { source: 'lt', target: 'ru' };
      console.log('✅ ЛИТОВСКИЙ: найдены специальные символы без кириллицы');
    }
    // 2. Если есть кириллица - однозначно русский
    else if (hasCyrillicChars) {
      result = { source: 'ru', target: 'lt' };
      console.log('✅ РУССКИЙ: найдена кириллица');
    }
    // 3. Если только базовая латиница - пробуем API определения языка
    else if (hasBasicLatin && typeof detectLanguage === 'function') {
      try {
        const detectedLang = await detectLanguage(text);
        console.log('🤖 API определил язык как:', detectedLang);
        
        if (detectedLang === 'lt' || detectedLang === 'lithuanian') {
          result = { source: 'lt', target: 'ru' };
          console.log('✅ ЛИТОВСКИЙ: подтверждено API');
        } else if (detectedLang === 'ru' || detectedLang === 'russian') {
          result = { source: 'ru', target: 'lt' };
          console.log('✅ РУССКИЙ: подтверждено API');
        } else {
          // API не определил или вернул другой язык
          result = { source: 'ru', target: 'lt' };
          console.log('🤷 API не определил LT/RU, считаем русским по умолчанию');
        }
      } catch (apiError) {
        console.log('⚠️ API detectLanguage не сработал:', apiError.message);
        // Fallback: короткие слова - русский, длинные - возможно литовский
        result = text.length < 15 
          ? { source: 'ru', target: 'lt' }
          : { source: 'lt', target: 'ru' };
        console.log(`🤷 Fallback по длине (${text.length} символов):`, result);
      }
    }
    // 4. Если нет ни латиницы, ни кириллицы (цифры, знаки) - считаем русским
    else {
      result = { source: 'ru', target: 'lt' };
      console.log('🤷 Неопределенный текст, считаем русским');
    }
    
    console.log('🎯 ФИНАЛЬНЫЙ результат:', result);
    return result;
    
  } catch (error) {
    console.error('❌ Критическая ошибка в getTranslationDirection:', error);
    
    logger.error('Language detection failed', {
      error: error.message,
      text: text.substring(0, 50),
      fallback: 'conservative_russian'
    });
    
    // Консервативный fallback - всегда русский → литовский
    const result = { source: 'ru', target: 'lt' };
    console.log('🚨 Критический fallback:', result);
    return result;
  }
}

// Обработка текстовых сообщений
bot.on('text', async (msg) => {
  if (msg.text.startsWith('/')) return;

  const chatId = msg.chat.id;
  const settings = getUserSettings(chatId);
  const startTime = Date.now();

  logger.userActivity({
    userId: chatId,
    command: 'text_message',
    messageType: 'text'
  });

  try {
    // Сначала определяем предполагаемое направление
    const detectedLangs = await getTranslationDirection(msg.text, settings.direction);

    // Если пользователь в ручном режиме - переводим сразу
    if (settings.direction !== 'auto') {
      // ИСПРАВЛЕНИЕ: Правильное сопоставление флагов с текстом
      const sourceEmoji = detectedLangs.source === 'lt' ? '🇱🇹' : '🇷🇺';
      const targetEmoji = detectedLangs.target === 'lt' ? '🇱🇹' : '🇷🇺';

      console.log('🔍 Ручной режим:', detectedLangs);
      const translated = await translateText(msg.text, detectedLangs.source, detectedLangs.target);

      settings.lastTranslation = translated;
      settings.lastSource = detectedLangs.target;

      await bot.sendMessage(chatId,
        `${sourceEmoji} "${msg.text}"\n${targetEmoji} "${translated}"`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                { text: "🔊 Озвучить", callback_data: `speak_${chatId}` }
              ]
            ]
          }
        }
      );
      return;
    }

    // В автоматическом режиме - показываем кнопки выбора
    console.log('🔍 Определено направление:', detectedLangs);
    
    // Эмодзи для кнопок
    const ltRuEmoji = getLanguageEmoji('lt', 'ru');
    const ruLtEmoji = getLanguageEmoji('ru', 'lt');
    
    await bot.sendMessage(chatId, 
      `📝 **Выберите направление перевода:**\n\n` +
      `Текст: "${msg.text}"`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { 
                text: `${ltRuEmoji.source}→${ltRuEmoji.target} Литовский → Русский`, 
                callback_data: `translate_lt_ru:${Buffer.from(msg.text).toString('base64')}` 
              }
            ],
            [
              { 
                text: `${ruLtEmoji.source}→${ruLtEmoji.target} Русский → Литовский`, 
                callback_data: `translate_ru_lt:${Buffer.from(msg.text).toString('base64')}` 
              }
            ],
            [
              { 
                text: "🤖 Автоопределение", 
                callback_data: `translate_auto:${Buffer.from(msg.text).toString('base64')}` 
              }
            ]
          ]
        }
      }
    );
    
  } catch (e) {
    console.error('❌ Ошибка обработки текста:', e);
    
    logger.error('Text translation failed', {
      userId: chatId,
      error: e.message,
      stack: e.stack,
      input: msg.text.substring(0, 100)
    });
    
    await bot.sendMessage(chatId, 
      `⚠️ **Ошибка перевода:**\n${e.message}`,
      { parse_mode: 'Markdown' }
    );
  }
});

// Обработчик для голосовых сообщений
bot.on('voice', async (msg) => {
  const chatId = msg.chat.id;
  const fileId = msg.voice.file_id;
  const settings = getUserSettings(chatId);
  const startTime = Date.now();
  const duration = msg.voice.duration;

  logger.audioProcessing({
    userId: chatId,
    duration: duration,
    fileSize: msg.voice.file_size,
    stage: 'started'
  });

  try {
    // Скачиваем файл
    const fileName = await bot.downloadFile(fileId, tmpDir);
    
    // Уведомляем пользователя
    await bot.sendMessage(chatId, '🎧 Обрабатываю голосовое сообщение...');
    
    // Транскрибируем аудио
    let transcript;
    try {
      transcript = await transcribeAudio(fileName, 'lt');
    } catch (error) {
      transcript = await transcribeAudio(fileName, 'ru');
    }
    
    // Определяем направление перевода
    const detectedLangs = await getTranslationDirection(transcript, settings.direction);

    // ИСПРАВЛЕНИЕ: Правильное сопоставление флагов с текстом
    const sourceEmoji = detectedLangs.source === 'lt' ? '🇱🇹' : '🇷🇺';
    const targetEmoji = detectedLangs.target === 'lt' ? '🇱🇹' : '🇷🇺';

    // Переводим текст
    const translated = await translateText(transcript, detectedLangs.source, detectedLangs.target);

    // Создаем аудио перевода
    const audioPath = await speakText(translated, detectedLangs.target);

    // Отправляем результаты пользователю
    await bot.sendMessage(chatId,
      `${sourceEmoji} "${transcript}"\n\n${targetEmoji} "${translated}"`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              { text: "🔊 Озвучить", callback_data: `speak_${chatId}` },
              { text: "🔄 Обратный перевод", callback_data: `reverse_${chatId}` }
            ]
          ]
        }
      }
    );

    await bot.sendAudio(chatId, audioPath, {
      caption: `🔊 Перевод на ${detectedLangs.target.toUpperCase()}`
    });
    
    // Сохраняем для повторного использования
    settings.lastTranslation = translated;
    settings.lastSource = detectedLangs.target;
    
  } catch (e) {
    logger.error('Voice processing failed', {
      userId: chatId,
      error: e.message,
      stack: e.stack
    });
    
    bot.sendMessage(chatId, '⚠️ Ошибка обработки голосового сообщения.');
  }
});

// Обработчик callback-запросов (кнопок)
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const settings = getUserSettings(chatId);

  try {
    // Обработка кнопок направления перевода
    if (query.data.startsWith('translate_')) {
      const [direction, encodedText] = query.data.split(':');
      const text = Buffer.from(encodedText, 'base64').toString('utf-8');

      let source, target;
      if (direction === 'translate_lt_ru') {
        source = 'lt'; target = 'ru';
      } else if (direction === 'translate_ru_lt') {
        source = 'ru'; target = 'lt';
      } else {
        // auto - определяем автоматически
        const detected = await getTranslationDirection(text, 'auto');
        source = detected.source;
        target = detected.target;
      }

      const translated = await translateText(text, source, target);

      // ИСПРАВЛЕНИЕ: Правильное сопоставление флагов с текстом
      const sourceEmoji = source === 'lt' ? '🇱🇹' : '🇷🇺';
      const targetEmoji = target === 'lt' ? '🇱🇹' : '🇷🇺';

      // Сохраняем для повторного использования
      settings.lastTranslation = translated;
      settings.lastSource = target;

      await bot.sendMessage(chatId,
        `${sourceEmoji} "${text}"\n${targetEmoji} "${translated}"`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                { text: "🔊 Озвучить", callback_data: `speak_${chatId}` },
                { text: "🔄 Обратный перевод", callback_data: `reverse_${chatId}` }
              ]
            ]
          }
        }
      );
      
      bot.answerCallbackQuery(query.id);
      return;
    }
    
    // Обработка кнопки озвучивания
    if (query.data.startsWith('speak_')) {
      const text = settings.lastTranslation;
      const lang = settings.lastSource;
      
      if (!text || !lang) {
        return bot.answerCallbackQuery(query.id, { text: 'Нет текста для озвучивания' });
      }
      
      const audioPath = await speakText(text, lang);
      await bot.sendAudio(chatId, audioPath, {
        caption: `🔊 Озвучка на ${lang.toUpperCase()}`
      });
      
      bot.answerCallbackQuery(query.id);
      return;
    }
    
    // Обработка кнопки обратного перевода
    if (query.data.startsWith('reverse_')) {
      const text = settings.lastTranslation;
      const source = settings.lastSource;

      if (!text || !source) {
        return bot.answerCallbackQuery(query.id, { text: 'Нет текста для обратного перевода' });
      }

      // Определяем целевой язык для обратного перевода
      const target = source === 'lt' ? 'ru' : 'lt';

      // ИСПРАВЛЕНИЕ: Правильное сопоставление флагов с текстом
      const sourceEmoji = source === 'lt' ? '🇱🇹' : '🇷🇺';
      const targetEmoji = target === 'lt' ? '🇱🇹' : '🇷🇺';

      const reverseTranslated = await translateText(text, source, target);

      await bot.sendMessage(chatId,
        `🔄 Обратный перевод:\n${sourceEmoji} "${text}"\n${targetEmoji} "${reverseTranslated}"`
      );
      
      bot.answerCallbackQuery(query.id);
    }
    
  } catch (e) {
    console.error('Ошибка обработки callback:', e);
    bot.answerCallbackQuery(query.id, { text: 'Ошибка обработки запроса' });
  }
});

// Обработчик команды start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  
  logger.userActivity({
    userId: chatId,
    command: '/start',
    messageType: 'command'
  });

  bot.sendMessage(chatId,
    `👋 Sveiki! Aš esu vertėjas 🇱🇹⇄🇷🇺\n\n` +
    `Режим: Автоматическое определение языка\n\n` +
    `Команды:\n` +
    `/mode_lt_ru - режим только ЛТ→РУ\n` +
    `/mode_ru_lt - режим только РУ→ЛТ\n` +
    `/mode_auto - автоматический режим\n` +
    `/status - текущий режим\n\n` +
    `Также можете отправлять голосовые сообщения.`
  );
});

// Обработчики команд режима
bot.onText(/\/mode_lt_ru/, (msg) => {
  const settings = getUserSettings(msg.chat.id);
  settings.direction = 'lt-ru';
  
  logger.userActivity({
    userId: msg.chat.id,
    command: '/mode_lt_ru',
    messageType: 'command'
  });
  
  bot.sendMessage(msg.chat.id, `🔁 Установлен режим: 🇱🇹 → 🇷🇺`);
});

bot.onText(/\/mode_ru_lt/, (msg) => {
  const settings = getUserSettings(msg.chat.id);
  settings.direction = 'ru-lt';
  
  logger.userActivity({
    userId: msg.chat.id,
    command: '/mode_ru_lt',
    messageType: 'command'
  });
  
  bot.sendMessage(msg.chat.id, `🔁 Установлен режим: 🇷🇺 → 🇱🇹`);
});

bot.onText(/\/mode_auto/, (msg) => {
  const settings = getUserSettings(msg.chat.id);
  settings.direction = 'auto';
  
  logger.userActivity({
    userId: msg.chat.id,
    command: '/mode_auto',
    messageType: 'command'
  });
  
  bot.sendMessage(msg.chat.id, `🔁 Установлен автоматический режим: 🇱🇹⇄🇷🇺`);
});

bot.onText(/\/status/, (msg) => {
  const settings = getUserSettings(msg.chat.id);
  let modeText = '';
  
  switch(settings.direction) {
    case 'lt-ru': modeText = '🇱🇹 → 🇷🇺'; break;
    case 'ru-lt': modeText = '🇷🇺 → 🇱🇹'; break;
    case 'auto': modeText = 'Автоматический 🇱🇹⇄🇷🇺'; break;
  }
  
  logger.userActivity({
    userId: msg.chat.id,
    command: '/status',
    messageType: 'command'
  });
  
  bot.sendMessage(msg.chat.id, `Текущий режим перевода: ${modeText}`);
});

// Обработка ошибок бота
bot.on('polling_error', (error) => {
  logger.error('Bot polling error', {
    error: error.message,
    stack: error.stack
  });
});

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

logger.info('Lithuanian translator bot started', {
  timestamp: new Date().toISOString(),
  features: ['auto_detection', 'voice_processing', 'logging']
});

console.log('[BOT] Lithuanian translator launched with auto language detection, logging and audio functionality');
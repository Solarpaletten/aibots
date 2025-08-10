#!/bin/bash

echo "🔧 SOLAR v2.0 - Интеграция готовых сервисов с OpenAI API"
echo "========================================================="

cd b/src/

# Создаем главный сервис интеграции
echo "🌍 Создание UnifiedTranslationService..."
cat > services/unifiedTranslationService.js << 'EOF'
const OpenAI = require('openai');
const { transcribeAudio } = require('./whisperService');
const { speakText } = require('./textToSpeechService');
const fs = require('fs');
const path = require('path');

class UnifiedTranslationService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    // Ваши готовые языковые пары
    this.supportedLanguages = {
      'EN': { name: 'English', flag: '🇺🇸', code: 'en' },
      'RU': { name: 'Русский', flag: '🇷🇺', code: 'ru' },
      'DE': { name: 'Deutsch', flag: '🇩🇪', code: 'de' },
      'ES': { name: 'Español', flag: '🇪🇸', code: 'es' },
      'CS': { name: 'Čeština', flag: '🇨🇿', code: 'cs' },
      'PL': { name: 'Polski', flag: '🇵🇱', code: 'pl' },
      'LT': { name: 'Lietuvių', flag: '🇱🇹', code: 'lt' },
      'LV': { name: 'Latviešu', flag: '🇱🇻', code: 'lv' },
      'NO': { name: 'Norsk', flag: '🇳🇴', code: 'no' }
    };

    // Готовые языковые пары из вашей экосистемы
    this.availablePairs = [
      'EN-RU', 'RU-EN', 'DE-RU', 'RU-DE',
      'CS-RU', 'ES-RU', 'LT-RU', 'LV-RU', 
      'NO-RU', 'PL-RU'
    ];
    
    console.log('🌍 Unified Translation Service готов с', Object.keys(this.supportedLanguages).length, 'языками');
  }

  // Получить все поддерживаемые языки для Frontend
  getSupportedLanguages() {
    return Object.entries(this.supportedLanguages).map(([code, config]) => ({
      code,
      name: config.name,
      flag: config.flag,
      nativeName: config.name
    }));
  }

  // Проверить поддержку языковой пары
  isPairSupported(fromLanguage, toLanguage) {
    const directPair = `${fromLanguage}-${toLanguage}`;
    const reversePair = `${toLanguage}-${fromLanguage}`;
    
    return this.availablePairs.includes(directPair) || 
           this.availablePairs.includes(reversePair) ||
           this.supportedLanguages[fromLanguage] && this.supportedLanguages[toLanguage];
  }

  // Основной метод перевода текста с OpenAI
  async translateText(text, fromLanguage, toLanguage) {
    const startTime = Date.now();
    
    try {
      // Валидация
      if (!this.supportedLanguages[fromLanguage] || !this.supportedLanguages[toLanguage]) {
        throw new Error(`Unsupported language pair: ${fromLanguage} → ${toLanguage}`);
      }

      if (fromLanguage === toLanguage) {
        return {
          originalText: text,
          translatedText: text,
          fromLanguage,
          toLanguage,
          processingTime: Date.now() - startTime,
          confidence: 1.0,
          provider: 'same-language'
        };
      }

      // Используем OpenAI для перевода (ваш готовый API ключ)
      const fromLang = this.supportedLanguages[fromLanguage].name;
      const toLang = this.supportedLanguages[toLanguage].name;
      
      const systemPrompt = `You are a professional translator. Translate the following text from ${fromLang} to ${toLang}. 
      
RULES:
- Provide ONLY the translation, no explanations
- Maintain the original tone and style
- Keep formatting if any
- For voice messages, translate naturally and conversationally`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        max_tokens: Math.min(4000, text.length * 3),
        temperature: 0.3
      });

      const translatedText = response.choices[0]?.message?.content?.trim();
      
      if (!translatedText) {
        throw new Error('Translation failed');
      }

      return {
        originalText: text,
        translatedText,
        fromLanguage,
        toLanguage,
        processingTime: Date.now() - startTime,
        confidence: 0.95,
        provider: 'openai-gpt4o-mini',
        usage: response.usage
      };

    } catch (error) {
      console.error('Translation error:', error);
      throw new Error(`Translation failed: ${error.message}`);
    }
  }

  // Voice-to-Voice перевод используя ваши готовые сервисы
  async translateVoice(audioFilePath, fromLanguage, toLanguage) {
    const startTime = Date.now();
    
    try {
      console.log('🎤 Starting voice translation:', { fromLanguage, toLanguage });
      
      // 1. Распознавание речи (ваш готовый whisperService)
      const transcript = await transcribeAudio(audioFilePath, this.supportedLanguages[fromLanguage].code);
      console.log('📝 Transcript:', transcript);
      
      // 2. Перевод текста (OpenAI)
      const translation = await this.translateText(transcript, fromLanguage, toLanguage);
      console.log('🌍 Translation:', translation.translatedText);
      
      // 3. Генерация речи (ваш готовый textToSpeechService)
      const audioPath = await speakText(translation.translatedText, this.supportedLanguages[toLanguage].code);
      console.log('🔊 Audio generated:', audioPath);
      
      return {
        originalText: transcript,
        translatedText: translation.translatedText,
        originalAudio: audioFilePath,
        translatedAudio: audioPath,
        fromLanguage,
        toLanguage,
        processingTime: Date.now() - startTime,
        confidence: translation.confidence,
        provider: 'solar-voice-pipeline'
      };

    } catch (error) {
      console.error('Voice translation error:', error);
      throw new Error(`Voice translation failed: ${error.message}`);
    }
  }

  // Автоопределение языка
  async detectLanguage(text) {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Detect the language of the given text. Respond with ONLY the ISO language code from this list: EN, RU, DE, ES, CS, PL, LT, LV, NO. If uncertain, respond with "EN".`
          },
          { role: 'user', content: text.substring(0, 500) }
        ],
        max_tokens: 10,
        temperature: 0.1
      });

      const detectedCode = response.choices[0]?.message?.content?.trim();
      
      if (this.supportedLanguages[detectedCode]) {
        return {
          language: detectedCode,
          confidence: 0.9,
          provider: 'openai-detection'
        };
      }

      return {
        language: 'EN',
        confidence: 0.5,
        provider: 'fallback'
      };

    } catch (error) {
      console.error('Language detection error:', error);
      return {
        language: 'EN',
        confidence: 0.3,
        provider: 'error-fallback'
      };
    }
  }

  // Получить статистику
  getStats() {
    return {
      supportedLanguages: Object.keys(this.supportedLanguages).length,
      availablePairs: this.availablePairs.length,
      features: [
        'text-translation',
        'voice-translation', 
        'language-detection',
        'real-time-processing'
      ],
      provider: 'SOLAR v2.0 + OpenAI',
      readyServices: [
        'whisperService',
        'textToSpeechService',
        'smartVoicePipeline',
        '12 Telegram Bots'
      ]
    };
  }
}

module.exports = { UnifiedTranslationService };
EOF

# Обновляем routes/translate.js для использования нового сервиса
echo "🛣️ Обновление Translation Routes..."
cat > routes/translate.js << 'EOF'
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { UnifiedTranslationService } = require('../services/unifiedTranslationService');

const router = express.Router();

// Настройка multer для загрузки файлов
const upload = multer({
  dest: path.join(__dirname, '../../uploads/'),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio files are allowed.'));
    }
  }
});

// Инициализируем сервис перевода
const translationService = new UnifiedTranslationService();

// GET /api/v2/translate/languages - Получить поддерживаемые языки
router.get('/languages', (req, res) => {
  try {
    const languages = translationService.getSupportedLanguages();
    res.json({
      success: true,
      data: {
        languages,
        stats: translationService.getStats()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get supported languages'
    });
  }
});

// POST /api/v2/translate/text - Перевод текста
router.post('/text', async (req, res) => {
  try {
    const { text, fromLanguage, toLanguage, autoDetect = false } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }

    let sourceLang = fromLanguage;
    
    // Автоопределение языка если нужно
    if (autoDetect || !fromLanguage) {
      const detection = await translationService.detectLanguage(text);
      sourceLang = detection.language;
    }

    if (!toLanguage) {
      return res.status(400).json({
        success: false,
        error: 'Target language is required'
      });
    }

    // Выполняем перевод
    const result = await translationService.translateText(text, sourceLang, toLanguage);
    
    res.json({
      success: true,
      data: {
        ...result,
        sessionId: `text-${Date.now()}`,
        autoDetected: autoDetect ? { language: sourceLang } : null
      }
    });

  } catch (error) {
    console.error('Text translation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Text translation failed'
    });
  }
});

// POST /api/v2/translate/voice - Перевод голоса
router.post('/voice', upload.single('audio'), async (req, res) => {
  let uploadedFile = null;
  
  try {
    const { fromLanguage, toLanguage } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Audio file is required'
      });
    }

    if (!fromLanguage || !toLanguage) {
      return res.status(400).json({
        success: false,
        error: 'Both source and target languages are required'
      });
    }

    uploadedFile = req.file.path;
    
    // Выполняем voice-to-voice перевод
    const result = await translationService.translateVoice(uploadedFile, fromLanguage, toLanguage);
    
    // Читаем сгенерированный аудиофайл
    let audioBase64 = null;
    if (result.translatedAudio && fs.existsSync(result.translatedAudio)) {
      const audioBuffer = fs.readFileSync(result.translatedAudio);
      audioBase64 = audioBuffer.toString('base64');
    }
    
    res.json({
      success: true,
      data: {
        originalText: result.originalText,
        translatedText: result.translatedText,
        translatedAudio: audioBase64,
        fromLanguage: result.fromLanguage,
        toLanguage: result.toLanguage,
        processingTime: result.processingTime,
        confidence: result.confidence,
        sessionId: `voice-${Date.now()}`
      }
    });

  } catch (error) {
    console.error('Voice translation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Voice translation failed'
    });
  } finally {
    // Cleanup uploaded file
    if (uploadedFile && fs.existsSync(uploadedFile)) {
      fs.unlink(uploadedFile, () => {});
    }
  }
});

// POST /api/v2/translate/detect - Определение языка
router.post('/detect', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }

    const result = await translationService.detectLanguage(text);
    
    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Language detection error:', error);
    res.status(500).json({
      success: false,
      error: 'Language detection failed'
    });
  }
});

// GET /api/v2/translate/stats - Статистика сервиса
router.get('/stats', (req, res) => {
  try {
    const stats = translationService.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get translation stats'
    });
  }
});

module.exports = router;
EOF

# Создаем недостающий translationService.js для обратной совместимости
echo "🔄 Создание совместимого translationService..."
cat > services/translationService.js << 'EOF'
const { UnifiedTranslationService } = require('./unifiedTranslationService');

// Инициализируем единый сервис
const unifiedService = new UnifiedTranslationService();

// Экспортируем функции для обратной совместимости с существующими ботами
async function translateText(text, targetLang, sourceLang) {
  // Конвертируем коды языков в наш формат
  const langMap = {
    'en': 'EN', 'ru': 'RU', 'de': 'DE', 'es': 'ES',
    'cs': 'CS', 'pl': 'PL', 'lt': 'LT', 'lv': 'LV', 'no': 'NO'
  };
  
  const fromLang = langMap[sourceLang] || sourceLang.toUpperCase();
  const toLang = langMap[targetLang] || targetLang.toUpperCase();
  
  try {
    const result = await unifiedService.translateText(text, fromLang, toLang);
    return result.translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
}

module.exports = {
  translateText,
  UnifiedTranslationService: unifiedService
};
EOF

echo ""
echo "✅ ГОТОВО! Интеграция завершена!"
echo ""
echo "🎯 Что создано:"
echo "- ✅ UnifiedTranslationService (использует ваши готовые сервисы)"
echo "- ✅ Интеграция с OpenAI API"
echo "- ✅ Обновленные API routes для Frontend"
echo "- ✅ Voice-to-Voice pipeline"
echo "- ✅ Совместимость с существующими ботами"
echo ""
echo "🌍 Поддерживаемые функции:"
echo "- 📝 Текстовый перевод (9 языков)"
echo "- 🎤 Голосовой перевод (Voice-to-Voice)"
echo "- 🔍 Автоопределение языка"
echo "- 📊 Статистика и мониторинг"
echo ""
echo "🚀 API Endpoints готовы:"
echo "- GET  /api/v2/translate/languages"
echo "- POST /api/v2/translate/text"
echo "- POST /api/v2/translate/voice"
echo "- POST /api/v2/translate/detect"
echo "- GET  /api/v2/translate/stats"
echo ""
echo "🔥 Backend готов к работе с Frontend! Перезапустите сервер: npm run dev"

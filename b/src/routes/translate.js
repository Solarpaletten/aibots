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

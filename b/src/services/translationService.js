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

// f/src/pages/Translate.tsx - Обновленная страница с Smart Input

import React, { useState } from 'react';
import { ArrowUpDown } from 'lucide-react';
import SmartTextInput from '../components/SmartTextInput';

const TranslatePage: React.FC = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [fromLanguage, setFromLanguage] = useState("English");
  const [toLanguage, setToLanguage] = useState("Русский");
  const [isTranslating, setIsTranslating] = useState(false);
  const [activeTab, setActiveTab] = useState<'text' | 'voice'>('text');

  // 🌍 Языки
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'cs', name: 'Czech', flag: '🇨🇿' },
    { code: 'pl', name: 'Polish', flag: '🇵🇱' },
  ];

  // 🔄 Смена языков местами
  const swapLanguages = () => {
    const temp = fromLanguage;
    setFromLanguage(toLanguage);
    setToLanguage(temp);
    
    // Также меняем местами тексты
    const tempText = inputText;
    setInputText(outputText);
    setOutputText(tempText);
  };

  // 🌐 Перевод текста (пока mock)
  const handleTranslate = async (text: string) => {
    setIsTranslating(true);
    setInputText(text); // Обновляем основное поле
    
    try {
      // Mock перевод с задержкой для реалистичности
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockTranslations: Record<string, string> = {
        "How are you doing today?": "Как дела сегодня?",
        "I would like to book a table": "Я хотел бы забронировать столик",
        "Where is the nearest hospital?": "Где ближайшая больница?",
        "Can you help me with directions?": "Можете помочь мне с направлениями?",
        "Good morning, how can I help you?": "Доброе утро, как я могу вам помочь?",
        "Thank you very much": "Большое спасибо",
        "Excuse me, do you speak English?": "Извините, вы говорите по-английски?",
        "Where is the bathroom?": "Где туалет?",
        "Can you help me find a taxi?": "Можете помочь мне найти такси?",
        "How are you feeling?": "Как вы себя чувствуете?",
        "How are things going?": "Как дела идут?"
      };
      
      const translation = mockTranslations[text] || `Перевод: ${text}`;
      setOutputText(translation);
      
    } catch (error) {
      console.error('Translation error:', error);
      setOutputText('Ошибка перевода. Попробуйте снова.');
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      {/* Заголовок */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
          🌍 SOLAR Voice Translator
        </h1>
        <p className="text-gray-600 text-lg">
          Real-time AI translation with smart completion
        </p>
      </div>

      {/* Селектор языков */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">From</span>
          <select
            value={fromLanguage}
            onChange={(e) => setFromLanguage(e.target.value)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.name}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={swapLanguages}
          className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
          title="Swap languages"
        >
          <ArrowUpDown className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">To</span>
          <select
            value={toLanguage}
            onChange={(e) => setToLanguage(e.target.value)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.name}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Табы */}
      <div className="flex justify-center mb-6">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('text')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'text'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📝 Text Translation
          </button>
          <button
            onClick={() => setActiveTab('voice')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'voice'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🎤 Voice Translation
          </button>
        </div>
      </div>

      {/* Основной интерфейс */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Поле ввода с AI подсказками */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Input ({fromLanguage}) {languages.find(l => l.name === fromLanguage)?.flag}
          </label>
          
          {activeTab === 'text' ? (
            <SmartTextInput
              value={inputText}
              onChange={setInputText}
              onTranslate={handleTranslate}
              placeholder={`Enter text in ${fromLanguage}... AI will help complete your sentence`}
              language={fromLanguage}
            />
          ) : (
            <div className="w-full min-h-[200px] p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">🎤</div>
                <div className="text-gray-600 font-medium">Voice Translation</div>
                <div className="text-sm text-gray-500 mt-1">Coming soon in v2.1.0</div>
              </div>
            </div>
          )}
        </div>

        {/* Результат перевода */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Translation ({toLanguage}) {languages.find(l => l.name === toLanguage)?.flag}
          </label>
          <div className="w-full min-h-[200px] p-4 border border-gray-300 rounded-lg bg-gray-50 relative">
            {isTranslating ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <span className="text-gray-600 font-medium">Translating with AI...</span>
                  <div className="text-sm text-gray-500 mt-1">Processing your text</div>
                </div>
              </div>
            ) : outputText ? (
              <div className="space-y-3">
                <div className="text-gray-800 leading-relaxed text-lg">{outputText}</div>
                <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                  <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    🔊 Play Audio
                  </button>
                  <button 
                    onClick={() => navigator.clipboard?.writeText(outputText)}
                    className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                  >
                    📋 Copy
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-3xl mb-2">🌟</div>
                  <div className="text-gray-500 italic">Your translation will appear here...</div>
                  <div className="text-sm text-gray-400 mt-1">Start typing to see AI suggestions</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Демо инструкции */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          🧪 Try AI Smart Completion:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
          <div className="flex items-start space-x-2">
            <span className="text-blue-500">⏎</span>
            <div>
              <div className="font-medium">Accept Suggestion</div>
              <div className="text-blue-700">Press Tab or click Accept</div>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-purple-500">✨</span>
            <div>
              <div className="font-medium">Continue with AI</div>
              <div className="text-blue-700">Ctrl+Enter or click Continue</div>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-gray-500">⎋</span>
            <div>
              <div className="font-medium">Dismiss</div>
              <div className="text-blue-700">Press Escape or click X</div>
            </div>
          </div>
        </div>
        
        {/* Примеры для быстрого тестирования */}
        <div className="space-y-2">
          <div className="font-medium text-blue-900">Quick test examples:</div>
          <div className="flex flex-wrap gap-2">
            {[
              "How are",
              "I would like", 
              "Where is",
              "Can you help",
              "Good morning",
              "Thank you"
            ].map((example, index) => (
              <button
                key={index}
                onClick={() => setInputText(example)}
                className="text-xs px-3 py-1 bg-white border border-blue-300 rounded-full hover:bg-blue-50 transition-colors"
              >
                "{example}"
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Статистика */}
      <div className="mt-6 text-center text-sm text-gray-500">
        🚀 SOLAR v2.0.0 • Smart AI Completion • Enterprise Ready
      </div>
    </div>
  );
};

export default TranslatePage;
import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Check, Sparkles, X } from 'lucide-react';

interface SmartTextInputProps {
  value: string;
  onChange: (value: string) => void;
  onTranslate: (text: string) => void;
  placeholder?: string;
  language?: string;
}

const SmartTextInput: React.FC<SmartTextInputProps> = ({
  value,
  onChange,
  onTranslate,
  placeholder = "Enter text to translate...",
  language = "EN"
}) => {
  const [suggestion, setSuggestion] = useState<string>("");
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // 🤖 AI Suggestion Generator (Mock - в реальности вызов к OpenAI)
  const generateSuggestion = async (currentText: string): Promise<string> => {
    // Симуляция AI подсказок для демо
    const suggestions: Record<string, string[]> = {
      "How are": [" you doing today?", " you feeling?", " things going?"],
      "I would like": [" to book a table", " to make a reservation", " some information"],
      "Where is": [" the nearest hospital?", " the bathroom?", " the train station?"],
      "Can you help": [" me with directions?", " me find a taxi?", " me translate this?"],
      "Good morning": [", how can I help you?", ", nice to meet you", ", have a great day"],
      "Thank you": [" very much", " for your help", " so much"],
      "Excuse me": [", do you speak English?", ", where is the exit?", ", can I ask you something?"]
    };

    // Поиск подходящей подсказки
    for (const [key, values] of Object.entries(suggestions)) {
      if (currentText.toLowerCase().includes(key.toLowerCase())) {
        const randomSuggestion = values[Math.floor(Math.random() * values.length)];
        return currentText + randomSuggestion;
      }
    }

    // Базовые подсказки на основе длины
    if (currentText.length > 5 && !currentText.endsWith('.') && !currentText.endsWith('?')) {
      const endings = ["?", ".", ", please.", " today.", " now."];
      return currentText + endings[Math.floor(Math.random() * endings.length)];
    }

    return "";
  };

  // 📝 Обработка ввода текста
  const handleTextChange = (newValue: string) => {
    onChange(newValue);
    setIsTyping(true);
    setShowSuggestion(false);

    // Debounce для генерации подсказок
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(async () => {
      setIsTyping(false);
      
      if (newValue.trim().length > 3) {
        const aiSuggestion = await generateSuggestion(newValue);
        if (aiSuggestion && aiSuggestion !== newValue) {
          setSuggestion(aiSuggestion);
          setShowSuggestion(true);
        }
      }
    }, 800);
  };

  // ✅ Принять подсказку
  const acceptSuggestion = () => {
    if (suggestion) {
      onChange(suggestion);
      setSuggestion("");
      setShowSuggestion(false);
      textareaRef.current?.focus();
    }
  };

  // ✨ Продолжить с AI
  const continueWithAI = async () => {
    const currentText = suggestion || value;
    const extended = await generateSuggestion(currentText + " ");
    if (extended) {
      setSuggestion(extended);
      setShowSuggestion(true);
    }
  };

  // ❌ Отклонить подсказку
  const rejectSuggestion = () => {
    setSuggestion("");
    setShowSuggestion(false);
    textareaRef.current?.focus();
  };

  // ⌨️ Обработка клавиш
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestion) {
      switch (e.key) {
        case 'Tab':
        case 'ArrowRight':
          e.preventDefault();
          acceptSuggestion();
          break;
        case 'Escape':
          e.preventDefault();
          rejectSuggestion();
          break;
        case 'Enter':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            continueWithAI();
          }
          break;
      }
    }
  };

  return (
    <div className="relative w-full">
      {/* Основное поле ввода */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => handleTextChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full min-h-[120px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-base leading-relaxed"
          style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
        />
        
        {/* Индикатор набора */}
        {isTyping && (
          <div className="absolute top-2 right-2">
            <div className="flex items-center space-x-1 text-blue-500">
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
      </div>

      {/* AI Подсказка */}
      {showSuggestion && suggestion && (
        <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-700">AI Suggestion</span>
            </div>
            <button
              onClick={rejectSuggestion}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Предлагаемый текст */}
          <div className="mb-3">
            <div className="text-sm text-gray-600 mb-1">Complete your text:</div>
            <div className="p-2 bg-white rounded border text-sm">
              <span className="text-gray-400">{value}</span>
              <span className="text-blue-600 font-medium">
                {suggestion.slice(value.length)}
              </span>
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="flex items-center space-x-2">
            <button
              onClick={acceptSuggestion}
              className="flex items-center space-x-1 px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              <Check className="w-4 h-4" />
              <span>Accept</span>
              <span className="text-blue-200 text-xs">Tab</span>
            </button>
            
            <button
              onClick={continueWithAI}
              className="flex items-center space-x-1 px-3 py-1.5 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors text-sm font-medium"
            >
              <Sparkles className="w-4 h-4" />
              <span>Continue</span>
              <span className="text-purple-200 text-xs">Ctrl+↵</span>
            </button>

            <div className="text-xs text-gray-500 ml-2">
              Press <kbd className="px-1 py-0.5 bg-gray-100 rounded">Esc</kbd> to dismiss
            </div>
          </div>
        </div>
      )}

      {/* Кнопка перевода */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {value.length} characters
        </div>
        
        <button
          onClick={() => onTranslate(suggestion || value)}
          disabled={!(suggestion || value).trim()}
          className="flex items-center space-x-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
        >
          <ArrowRight className="w-4 h-4" />
          <span>Translate Text</span>
        </button>
      </div>

      {/* Подсказки по использованию */}
      <div className="mt-2 text-xs text-gray-400">
        💡 Start typing and AI will suggest completions. Use Tab to accept or Ctrl+Enter to extend.
      </div>
    </div>
  );
};

// 🎯 Демо компонент для тестирования
const SmartTranslationDemo: React.FC = () => {
  const [inputText, setInputText] = useState("");
  const [translation, setTranslation] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async (text: string) => {
    setIsTranslating(true);
    
    // Симуляция перевода (в реальности - вызов API)
    setTimeout(() => {
      const mockTranslations: Record<string, string> = {
        "How are you doing today?": "Как дела сегодня?",
        "I would like to book a table": "Я хотел бы забронировать столик",
        "Where is the nearest hospital?": "Где ближайшая больница?",
        "Can you help me with directions?": "Можете помочь мне с направлениями?",
        "Good morning, how can I help you?": "Доброе утро, как я могу вам помочь?",
        "Thank you very much": "Большое спасибо"
      };
      
      const translated = mockTranslations[text] || `Перевод: ${text}`;
      setTranslation(translated);
      setIsTranslating(false);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Заголовок */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🧠 Smart Translation with AI Completion
        </h1>
        <p className="text-gray-600">
          Start typing and watch AI help you complete your thoughts
        </p>
      </div>

      {/* Основной интерфейс */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Поле ввода с AI подсказками */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Input (EN) 🇺🇸
          </label>
          <SmartTextInput
            value={inputText}
            onChange={setInputText}
            onTranslate={handleTranslate}
            placeholder="Start typing... AI will help complete your sentence"
            language="EN"
          />
        </div>

        {/* Результат перевода */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Translation (RU) 🇷🇺
          </label>
          <div className="w-full min-h-[120px] p-4 border border-gray-300 rounded-lg bg-gray-50">
            {isTranslating ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-gray-600">Translating...</span>
              </div>
            ) : translation ? (
              <div className="text-gray-800 leading-relaxed">{translation}</div>
            ) : (
              <div className="text-gray-500 italic">Translation will appear here...</div>
            )}
          </div>
        </div>
      </div>

      {/* Инструкции */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">🎮 How to use Smart Completion:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
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
      </div>

      {/* Примеры для тестирования */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">🧪 Try these examples:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
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
              className="text-left p-2 bg-white border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              <code className="text-blue-600">"{example}"</code>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SmartTranslationDemo;
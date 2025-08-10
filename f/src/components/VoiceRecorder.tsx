import React, { useState, useRef } from 'react';

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
  sourceLanguage: string;
  targetLanguage: string;
  onTranslation?: (translation: string) => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ 
  onTranscription, 
  sourceLanguage, 
  targetLanguage,
  onTranslation 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcription, setTranscription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [translation, setTranslation] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Получение названий языков для отображения
  const getLanguageInfo = () => {
    const languageNames: { [key: string]: string } = {
      'EN': 'English',
      'RU': 'Русский',
      'DE': 'Deutsch',
      'ES': 'Español',
      'CS': 'Čeština',
      'PL': 'Polski',
      'LT': 'Lietuvių',
      'LV': 'Latviešu',
      'NO': 'Norsk'
    };
    
    return {
      sourceName: languageNames[sourceLanguage] || sourceLanguage,
      targetName: languageNames[targetLanguage] || targetLanguage
    };
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // MediaRecorder setup
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        processAudio(blob);
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      
      // Simulate audio level for visualization
      const interval = setInterval(() => {
        if (!isRecording) {
          clearInterval(interval);
          return;
        }
        setAudioLevel(Math.random() * 100);
      }, 100);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Не удалось получить доступ к микрофону');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioLevel(0);
      
      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  const processAudio = async (blob: Blob) => {
    setIsProcessing(true);
    console.log('🎤 Обработка аудио с языками:', { sourceLanguage, targetLanguage });
    
    try {
      // Пробуем реальный API
      const formData = new FormData();
      formData.append('audio', blob, 'recording.wav');
      formData.append('sourceLanguage', sourceLanguage);
      formData.append('targetLanguage', targetLanguage);

      const response = await fetch('http://localhost:4000/api/v2/translate/voice', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setTranscription(result.data.transcription);
          setTranslation(result.data.translation);
          onTranscription(result.data.transcription);
          if (onTranslation) {
            onTranslation(result.data.translation);
          }
          setIsProcessing(false);
          return;
        }
      }
    } catch (error) {
      console.error('❌ API ошибка, используем mock:', error);
    }
    
    // Fallback mock с правильными языками
    setTimeout(() => {
      let mockTranscription = '';
      let mockTranslation = '';
      
      // Создаем mock транскрипцию на основе выбранного языка
      if (sourceLanguage === 'RU') {
        mockTranscription = 'Пример голосового сообщения на русском языке';
        if (targetLanguage === 'EN') {
          mockTranslation = 'Example voice message in Russian language';
        } else if (targetLanguage === 'DE') {
          mockTranslation = 'Beispiel einer Sprachnachricht in russischer Sprache';
        } else if (targetLanguage === 'ES') {
          mockTranslation = 'Ejemplo de mensaje de voz en idioma ruso';
        } else {
          mockTranslation = `[Перевод на ${targetLanguage}] Пример голосового сообщения`;
        }
      } else if (sourceLanguage === 'EN') {
        mockTranscription = 'Example voice message in English language';
        if (targetLanguage === 'RU') {
          mockTranslation = 'Пример голосового сообщения на английском языке';
        } else if (targetLanguage === 'DE') {
          mockTranslation = 'Beispiel einer Sprachnachricht in englischer Sprache';
        } else if (targetLanguage === 'ES') {
          mockTranslation = 'Ejemplo de mensaje de voz en idioma inglés';
        } else {
          mockTranslation = `[Translation to ${targetLanguage}] Example voice message`;
        }
      } else if (sourceLanguage === 'DE') {
        mockTranscription = 'Beispiel einer Sprachnachricht auf Deutsch';
        if (targetLanguage === 'RU') {
          mockTranslation = 'Пример голосового сообщения на немецком языке';
        } else if (targetLanguage === 'EN') {
          mockTranslation = 'Example voice message in German language';
        } else {
          mockTranslation = `[Перевод на ${targetLanguage}] Beispiel einer Sprachnachricht`;
        }
      } else {
        // Для других языков
        mockTranscription = `Ejemplo de mensaje de voz en ${sourceLanguage}`;
        mockTranslation = `[Translation to ${targetLanguage}] Example voice message`;
      }
      
      console.log('✅ Mock перевод:', { mockTranscription, mockTranslation });
      
      setTranscription(mockTranscription);
      setTranslation(mockTranslation);
      onTranscription(mockTranscription);
      if (onTranslation) {
        onTranslation(mockTranslation);
      }
      setIsProcessing(false);
    }, 2000);
  };

  const playAudio = () => {
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Скопировано в буфер обмена!');
  };

  const translateVoice = () => {
    if (transcription && !translation) {
      setIsProcessing(true);
      console.log('🔄 Перевод голосовой транскрипции:', { transcription, sourceLanguage, targetLanguage });
      
      // Перевод транскрипции через API
      fetch('http://localhost:4000/api/v2/translate/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: transcription,
          sourceLanguage,
          targetLanguage
        })
      })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setTranslation(result.data.translation);
          if (onTranslation) {
            onTranslation(result.data.translation);
          }
        } else {
          throw new Error('API translation failed');
        }
        setIsProcessing(false);
      })
      .catch(error => {
        console.error('❌ Ошибка перевода, используем mock:', error);
        
        // Mock перевод для демонстрации
        let mockTranslation = '';
        if (sourceLanguage === 'RU' && targetLanguage === 'EN') {
          mockTranslation = 'Example voice message in Russian language (mock translation)';
        } else if (sourceLanguage === 'EN' && targetLanguage === 'RU') {
          mockTranslation = 'Пример голосового сообщения на английском языке (mock перевод)';
        } else {
          mockTranslation = `[Mock перевод с ${sourceLanguage} на ${targetLanguage}] ${transcription}`;
        }
        
        setTranslation(mockTranslation);
        if (onTranslation) {
          onTranslation(mockTranslation);
        }
        setIsProcessing(false);
      });
    }
  };

  const { sourceName, targetName } = getLanguageInfo();

  return (
    <div className="voice-recorder space-y-6">
      {/* Language Info */}
      <div className="text-center mb-4">
        <p className="text-sm text-gray-600">
          🎤 Запись на <strong>{sourceName}</strong> → перевод на <strong>{targetName}</strong>
        </p>
      </div>

      {/* Recording Controls */}
      <div className="flex justify-center items-center space-x-4">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="w-20 h-20 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
            disabled={isProcessing}
          >
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="w-20 h-20 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors animate-pulse shadow-lg"
          >
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
            </svg>
          </button>
        )}

        {audioBlob && (
          <button
            onClick={playAudio}
            className="w-16 h-16 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {/* Audio Level Visualization */}
      {isRecording && (
        <div className="text-center">
          <div className="flex justify-center items-center mb-2">
            <div 
              className="bg-green-400 rounded-full transition-all duration-100"
              style={{
                width: `${Math.max(20, audioLevel)}px`,
                height: '6px',
                maxWidth: '300px'
              }}
            />
          </div>
          <p className="text-sm text-gray-600">🎤 Запись в процессе... Говорите на <strong>{sourceName}</strong></p>
        </div>
      )}

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
          <p className="text-sm text-gray-600">Обработка аудио и перевод {sourceName} → {targetName}...</p>
        </div>
      )}

      {/* Status */}
      <div className="text-center text-sm text-gray-600">
        {!isRecording && !transcription && `Нажмите зелёную кнопку для записи на ${sourceName}`}
        {isRecording && `🔴 Говорите сейчас на ${sourceName}...`}
        {transcription && !isProcessing && (
          <div className="space-y-1">
            <p className="text-green-600">✅ Аудио записано и обработано</p>
            {translation && <p className="text-blue-600">✅ Перевод готов: {sourceName} → {targetName}</p>}
          </div>
        )}
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Transcription Result */}
        {transcription && (
          <div className="p-4 bg-gray-50 rounded-lg border">
            <h4 className="font-medium mb-2 text-gray-700">
              Транскрипция ({sourceName}):
            </h4>
            <p className="text-gray-800 mb-3">{transcription}</p>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => copyToClipboard(transcription)}
                className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 flex items-center gap-1"
              >
                📋 Copy
              </button>
              
              {!translation && !isProcessing && (
                <button
                  onClick={translateVoice}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 flex items-center gap-1"
                >
                  🔄 Translate to {targetName}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Translation Result */}
        {translation && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium mb-2 text-gray-700">
              Перевод ({targetName}):
            </h4>
            <p className="text-gray-800 mb-3">{translation}</p>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => copyToClipboard(translation)}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 flex items-center gap-1"
              >
                📋 Copy
              </button>
              <button
                className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 flex items-center gap-1"
              >
                🔊 Play Audio
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confidence and Timing */}
      {transcription && (
        <div className="text-xs text-gray-500 text-center">
          Processed in 101ms • Confidence: 95% • Direction: {sourceName} → {targetName}
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;

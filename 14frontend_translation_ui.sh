#!/bin/bash

echo "🎨 SOLAR v2.0 - Создание Translation UI для Frontend"
echo "==================================================="

cd f/

# Создаем Translation Service для Frontend
echo "🌐 Создание Frontend Translation Service..."
cat > src/services/translationService.ts << 'EOF'
import { apiClient } from './apiClient'
import { APP_CONFIG } from '@/utils/constants'

export interface TranslationRequest {
  text: string
  fromLanguage: string
  toLanguage: string
  autoDetect?: boolean
}

export interface VoiceTranslationRequest {
  audio: File
  fromLanguage: string
  toLanguage: string
}

export interface TranslationResponse {
  originalText: string
  translatedText: string
  fromLanguage: string
  toLanguage: string
  processingTime: number
  confidence: number
  sessionId: string
  translatedAudio?: string
}

export interface Language {
  code: string
  name: string
  flag: string
  nativeName: string
}

class TranslationService {
  private baseUrl = APP_CONFIG.apiUrl

  // Получить поддерживаемые языки
  async getSupportedLanguages(): Promise<Language[]> {
    const response = await apiClient.get('/translate/languages')
    return response.data.data.languages
  }

  // Текстовый перевод
  async translateText(request: TranslationRequest): Promise<TranslationResponse> {
    const response = await apiClient.post('/translate/text', request)
    return response.data.data
  }

  // Голосовой перевод
  async translateVoice(request: VoiceTranslationRequest): Promise<TranslationResponse> {
    const formData = new FormData()
    formData.append('audio', request.audio)
    formData.append('fromLanguage', request.fromLanguage)
    formData.append('toLanguage', request.toLanguage)

    const response = await apiClient.post('/translate/voice', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.data
  }

  // Определение языка
  async detectLanguage(text: string): Promise<{ language: string; confidence: number }> {
    const response = await apiClient.post('/translate/detect', { text })
    return response.data.data
  }

  // Статистика сервиса
  async getStats() {
    const response = await apiClient.get('/translate/stats')
    return response.data.data
  }
}

export const translationService = new TranslationService()
EOF

# Создаем Language Selector компонент
echo "🌍 Создание Language Selector..."
cat > src/components/ui/LanguageSelector.tsx << 'EOF'
import { useState, useEffect } from 'react'
import { ChevronDownIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/outline'
import { translationService, Language } from '@/services/translationService'

interface LanguageSelectorProps {
  fromLanguage: string
  toLanguage: string
  onFromLanguageChange: (language: string) => void
  onToLanguageChange: (language: string) => void
  onSwapLanguages: () => void
}

const LanguageSelector = ({
  fromLanguage,
  toLanguage,
  onFromLanguageChange,
  onToLanguageChange,
  onSwapLanguages
}: LanguageSelectorProps) => {
  const [languages, setLanguages] = useState<Language[]>([])
  const [isFromOpen, setIsFromOpen] = useState(false)
  const [isToOpen, setIsToOpen] = useState(false)

  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const supportedLanguages = await translationService.getSupportedLanguages()
        setLanguages(supportedLanguages)
      } catch (error) {
        console.error('Failed to load languages:', error)
      }
    }
    loadLanguages()
  }, [])

  const getLanguageByCode = (code: string) => {
    return languages.find(lang => lang.code === code)
  }

  const LanguageDropdown = ({ 
    value, 
    onChange, 
    isOpen, 
    setIsOpen, 
    placeholder = "Select language"
  }: {
    value: string
    onChange: (code: string) => void
    isOpen: boolean
    setIsOpen: (open: boolean) => void
    placeholder?: string
  }) => {
    const selectedLanguage = getLanguageByCode(value)

    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {selectedLanguage ? (
                <>
                  <span className="text-2xl">{selectedLanguage.flag}</span>
                  <div>
                    <div className="font-medium text-gray-900">{selectedLanguage.name}</div>
                    <div className="text-sm text-gray-500">{selectedLanguage.nativeName}</div>
                  </div>
                </>
              ) : (
                <span className="text-gray-500">{placeholder}</span>
              )}
            </div>
            <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => {
                  onChange(language.code)
                  setIsOpen(false)
                }}
                className="w-full px-4 py-3 text-left hover:bg-blue-50 focus:outline-none focus:bg-blue-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{language.flag}</span>
                  <div>
                    <div className="font-medium text-gray-900">{language.name}</div>
                    <div className="text-sm text-gray-500">{language.nativeName}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
        <LanguageDropdown
          value={fromLanguage}
          onChange={onFromLanguageChange}
          isOpen={isFromOpen}
          setIsOpen={setIsFromOpen}
          placeholder="Select source language"
        />
      </div>

      <button
        onClick={onSwapLanguages}
        className="mt-7 p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        title="Swap languages"
      >
        <ArrowsRightLeftIcon className="w-5 h-5" />
      </button>

      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
        <LanguageDropdown
          value={toLanguage}
          onChange={onToLanguageChange}
          isOpen={isToOpen}
          setIsOpen={setIsToOpen}
          placeholder="Select target language"
        />
      </div>
    </div>
  )
}

export default LanguageSelector
EOF

# Создаем Voice Recorder компонент
echo "🎤 Создание Voice Recorder..."
cat > src/components/ui/VoiceRecorder.tsx << 'EOF'
import { useState, useRef, useEffect } from 'react'
import { MicrophoneIcon, StopIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/outline'

interface VoiceRecorderProps {
  onRecordingComplete: (audioFile: File) => void
  isRecording: boolean
  onRecordingStart: () => void
  onRecordingStop: () => void
  disabled?: boolean
}

const VoiceRecorder = ({
  onRecordingComplete,
  isRecording,
  onRecordingStart,
  onRecordingStop,
  disabled = false
}: VoiceRecorderProps) => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioLevel, setAudioLevel] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const animationRef = useRef<number | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      })

      // Создаем анализатор для визуализации уровня звука
      const audioContext = new AudioContext()
      const analyser = audioContext.createAnalyser()
      const microphone = audioContext.createMediaStreamSource(stream)
      
      analyser.fftSize = 256
      microphone.connect(analyser)
      analyserRef.current = analyser

      // Запускаем визуализацию
      startAudioLevelAnimation()

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })

      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const audioFile = new File([audioBlob], `recording-${Date.now()}.webm`, {
          type: 'audio/webm'
        })
        
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)
        onRecordingComplete(audioFile)
        
        // Останавливаем поток
        stream.getTracks().forEach(track => track.stop())
        stopAudioLevelAnimation()
      }

      mediaRecorder.start(100)
      onRecordingStart()
      
      // Запускаем таймер
      setRecordingTime(0)
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Unable to access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
      onRecordingStop()
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const startAudioLevelAnimation = () => {
    const updateAudioLevel = () => {
      if (analyserRef.current) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
        analyserRef.current.getByteFrequencyData(dataArray)
        
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length
        setAudioLevel(average / 255)
      }
      
      if (isRecording) {
        animationRef.current = requestAnimationFrame(updateAudioLevel)
      }
    }
    updateAudioLevel()
  }

  const stopAudioLevelAnimation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    setAudioLevel(0)
  }

  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [])

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="text-center">
        {!isRecording && !audioUrl && (
          <button
            onClick={startRecording}
            disabled={disabled}
            className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-full transition-colors shadow-lg"
          >
            <MicrophoneIcon className="w-8 h-8" />
          </button>
        )}

        {isRecording && (
          <div className="space-y-4">
            <button
              onClick={stopRecording}
              className="inline-flex items-center justify-center w-16 h-16 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors shadow-lg animate-pulse"
            >
              <StopIcon className="w-8 h-8" />
            </button>
            
            <div className="flex items-center justify-center space-x-4">
              <div className="text-lg font-mono text-gray-700">{formatTime(recordingTime)}</div>
              
              {/* Визуализация уровня звука */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 h-8 rounded-full transition-all duration-100 ${
                      audioLevel > (i + 1) * 0.2 ? 'bg-red-500' : 'bg-gray-300'
                    }`}
                    style={{
                      height: audioLevel > (i + 1) * 0.2 ? `${16 + audioLevel * 16}px` : '8px'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {audioUrl && !isRecording && (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={togglePlayback}
                className="inline-flex items-center justify-center w-12 h-12 bg-green-600 hover:bg-green-700 text-white rounded-full transition-colors"
              >
                {isPlaying ? (
                  <PauseIcon className="w-6 h-6" />
                ) : (
                  <PlayIcon className="w-6 h-6" />
                )}
              </button>
              
              <button
                onClick={startRecording}
                disabled={disabled}
                className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-full transition-colors"
              >
                <MicrophoneIcon className="w-6 h-6" />
              </button>
            </div>
            
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          </div>
        )}

        <div className="mt-4 text-sm text-gray-500">
          {isRecording ? 'Recording... Click stop when finished' : 
           audioUrl ? 'Ready to translate. Record again or translate current recording.' :
           'Click microphone to start recording'}
        </div>
      </div>
    </div>
  )
}

export default VoiceRecorder
EOF

# Обновляем TranslatePage с новыми компонентами
echo "📝 Создание полноценной страницы перевода..."
cat > src/pages/TranslatePage.tsx << 'EOF'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import LanguageSelector from '@/components/ui/LanguageSelector'
import VoiceRecorder from '@/components/ui/VoiceRecorder'
import { translationService, TranslationResponse } from '@/services/translationService'
import { SpeakerWaveIcon, ClipboardIcon } from '@heroicons/react/24/outline'

const TranslatePage = () => {
  const [fromLanguage, setFromLanguage] = useState('EN')
  const [toLanguage, setToLanguage] = useState('RU')
  const [inputText, setInputText] = useState('')
  const [isTranslating, setIsTranslating] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [result, setResult] = useState<TranslationResponse | null>(null)
  const [activeTab, setActiveTab] = useState<'text' | 'voice'>('text')

  const handleSwapLanguages = () => {
    setFromLanguage(toLanguage)
    setToLanguage(fromLanguage)
    if (result) {
      setInputText(result.translatedText)
      setResult(null)
    }
  }

  const handleTextTranslation = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter text to translate')
      return
    }

    setIsTranslating(true)
    try {
      const response = await translationService.translateText({
        text: inputText,
        fromLanguage,
        toLanguage
      })
      setResult(response)
      toast.success('Translation completed!')
    } catch (error) {
      console.error('Translation error:', error)
      toast.error('Translation failed. Please try again.')
    } finally {
      setIsTranslating(false)
    }
  }

  const handleVoiceTranslation = async (audioFile: File) => {
    setIsTranslating(true)
    try {
      const response = await translationService.translateVoice({
        audio: audioFile,
        fromLanguage,
        toLanguage
      })
      setResult(response)
      setInputText(response.originalText)
      toast.success('Voice translation completed!')
    } catch (error) {
      console.error('Voice translation error:', error)
      toast.error('Voice translation failed. Please try again.')
    } finally {
      setIsTranslating(false)
    }
  }

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const handlePlayAudio = (audioBase64: string) => {
    try {
      const audioBlob = new Blob([atob(audioBase64)], { type: 'audio/mpeg' })
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      audio.play()
    } catch (error) {
      console.error('Audio playback error:', error)
      toast.error('Unable to play audio')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            🌍 SOLAR Voice Translator
          </h1>

          {/* Language Selector */}
          <div className="mb-8">
            <LanguageSelector
              fromLanguage={fromLanguage}
              toLanguage={toLanguage}
              onFromLanguageChange={setFromLanguage}
              onToLanguageChange={setToLanguage}
              onSwapLanguages={handleSwapLanguages}
            />
          </div>

          {/* Tab Selector */}
          <div className="flex mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('text')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'text'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📝 Text Translation
            </button>
            <button
              onClick={() => setActiveTab('voice')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'voice'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              🎤 Voice Translation
            </button>
          </div>

          {/* Translation Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Input ({fromLanguage})
              </h3>
              
              {activeTab === 'text' ? (
                <div className="space-y-4">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Enter text to translate..."
                    className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                  <button
                    onClick={handleTextTranslation}
                    disabled={isTranslating || !inputText.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition-colors"
                  >
                    {isTranslating ? 'Translating...' : 'Translate Text'}
                  </button>
                </div>
              ) : (
                <VoiceRecorder
                  onRecordingComplete={handleVoiceTranslation}
                  isRecording={isRecording}
                  onRecordingStart={() => setIsRecording(true)}
                  onRecordingStop={() => setIsRecording(false)}
                  disabled={isTranslating}
                />
              )}
            </div>

            {/* Output Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Translation ({toLanguage})
              </h3>
              
              {result ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg min-h-40">
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {result.translatedText}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleCopyToClipboard(result.translatedText)}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                    >
                      <ClipboardIcon className="w-4 h-4" />
                      <span>Copy</span>
                    </button>
                    
                    {result.translatedAudio && (
                      <button
                        onClick={() => handlePlayAudio(result.translatedAudio!)}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
                      >
                        <SpeakerWaveIcon className="w-4 h-4" />
                        <span>Play Audio</span>
                      </button>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    Processed in {result.processingTime}ms • Confidence: {Math.round(result.confidence * 100)}%
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg min-h-40 flex items-center justify-center">
                  <p className="text-gray-500">Translation will appear here...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TranslatePage
EOF

# Устанавливаем необходимые иконки
echo "📦 Установка Heroicons..."
npm install @heroicons/react

echo ""
echo "✅ ГОТОВО! Translation UI создан!"
echo ""
echo "🎯 Что создано:"
echo "- ✅ TranslationService для Frontend"
echo "- ✅ LanguageSelector с флагами всех языков"
echo "- ✅ VoiceRecorder с визуализацией звука"
echo "- ✅ Полноценная TranslatePage"
echo "- ✅ Интеграция с Backend API"
echo ""
echo "🚀 Возможности:"
echo "- 📝 Текстовый перевод (9 языков)"
echo "- 🎤 Голосовой перевод с записью"
echo "- 🔄 Переключение языков"
echo "- 🔊 Воспроизведение результатов"
echo "- 📋 Копирование в буфер обмена"
echo ""
echo "🌐 Теперь откройте http://localhost:3000 и перейдите на страницу 'Start Translating'!"
echo "🔥 ПОЛНОЦЕННЫЙ VOICE TRANSLATOR ГОТОВ!"

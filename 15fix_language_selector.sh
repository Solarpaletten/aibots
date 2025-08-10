#!/bin/bash

echo "🔧 SOLAR v2.0 - Исправление Language Selector"
echo "============================================="

cd f/

# Создаем простой рабочий Language Selector
echo "🌍 Создание работающего Language Selector..."
cat > src/components/ui/LanguageSelector.tsx << 'EOF'
import { useState, useEffect } from 'react'
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadLanguages = async () => {
      try {
        console.log('Loading languages...')
        const supportedLanguages = await translationService.getSupportedLanguages()
        console.log('Loaded languages:', supportedLanguages)
        setLanguages(supportedLanguages)
      } catch (error) {
        console.error('Failed to load languages:', error)
        // Fallback languages если API не работает
        setLanguages([
          { code: 'EN', name: 'English', flag: '🇺🇸', nativeName: 'English' },
          { code: 'RU', name: 'Русский', flag: '🇷🇺', nativeName: 'Русский' },
          { code: 'DE', name: 'Deutsch', flag: '🇩🇪', nativeName: 'Deutsch' },
          { code: 'ES', name: 'Español', flag: '🇪🇸', nativeName: 'Español' },
          { code: 'CS', name: 'Čeština', flag: '🇨🇿', nativeName: 'Čeština' },
          { code: 'PL', name: 'Polski', flag: '🇵🇱', nativeName: 'Polski' },
          { code: 'LT', name: 'Lietuvių', flag: '🇱🇹', nativeName: 'Lietuvių' },
          { code: 'LV', name: 'Latviešu', flag: '🇱🇻', nativeName: 'Latviešu' },
          { code: 'NO', name: 'Norsk', flag: '🇳🇴', nativeName: 'Norsk' }
        ])
      } finally {
        setLoading(false)
      }
    }
    loadLanguages()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
          <div className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg animate-pulse">
            Loading languages...
          </div>
        </div>
        <div className="mt-7 p-2">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
          <div className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg animate-pulse">
            Loading languages...
          </div>
        </div>
      </div>
    )
  }

  const getLanguageByCode = (code: string) => {
    return languages.find(lang => lang.code === code) || languages[0]
  }

  return (
    <div className="flex items-center space-x-4">
      {/* From Language */}
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
        <select
          value={fromLanguage}
          onChange={(e) => onFromLanguageChange(e.target.value)}
          className="w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        >
          {languages.map((language) => (
            <option key={language.code} value={language.code}>
              {language.flag} {language.name}
            </option>
          ))}
        </select>
      </div>

      {/* Swap Button */}
      <button
        onClick={onSwapLanguages}
        className="mt-7 p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        title="Swap languages"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      </button>

      {/* To Language */}
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
        <select
          value={toLanguage}
          onChange={(e) => onToLanguageChange(e.target.value)}
          className="w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        >
          {languages.map((language) => (
            <option key={language.code} value={language.code}>
              {language.flag} {language.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default LanguageSelector
EOF

# Обновляем API Client с правильным портом
echo "🌐 Обновление API Client..."
cat > src/services/apiClient.ts << 'EOF'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v2'

console.log('API Base URL:', API_BASE_URL)

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000
})

// Request interceptor for auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  console.log('Making API request to:', config.url)
  return config
})

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log('API response:', response.data)
    return response
  },
  (error) => {
    console.error('API error:', error)
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      // Не редиректим на login для демо
    }
    return Promise.reject(error)
  }
)
EOF

# Обновляем константы с правильным портом
echo "🔧 Обновление констант..."
cat > src/utils/constants.ts << 'EOF'
import { LanguageOption } from '@/types/translation'

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'EN', name: 'English', flag: '🇺🇸' },
  { code: 'RU', name: 'Русский', flag: '🇷🇺' },
  { code: 'DE', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ES', name: 'Español', flag: '🇪🇸' },
  { code: 'CS', name: 'Čeština', flag: '🇨🇿' },
  { code: 'PL', name: 'Polski', flag: '🇵🇱' },
  { code: 'LT', name: 'Lietuvių', flag: '🇱🇹' },
  { code: 'LV', name: 'Latviešu', flag: '🇱🇻' },
  { code: 'NO', name: 'Norsk', flag: '🇳🇴' },
]

export const SUBSCRIPTION_LIMITS = {
  FREE: {
    voiceMinutesPerMonth: 50,
    apiCallsPerMonth: 1000,
    concurrentCalls: 1,
  },
  PREMIUM: {
    voiceMinutesPerMonth: 1000,
    apiCallsPerMonth: 10000,
    concurrentCalls: 5,
  },
  BUSINESS: {
    voiceMinutesPerMonth: 10000,
    apiCallsPerMonth: 100000,
    concurrentCalls: 20,
  },
}

export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || 'SOLAR Voice Translator',
  version: import.meta.env.VITE_APP_VERSION || '2.0.0',
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v2',
  socketUrl: import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000',
}
EOF

# Обновляем .env с правильным портом
echo "⚙️ Обновление .env..."
cat > .env << 'EOF'
# Backend API URL (порт 4000!)
VITE_API_URL=http://localhost:4000/api/v2

# Environment
VITE_NODE_ENV=development

# App Configuration
VITE_APP_NAME="SOLAR Translator"
VITE_APP_VERSION="2.0.0"

# Socket.IO URL
VITE_SOCKET_URL=http://localhost:4000
EOF

# Простая версия VoiceRecorder без лишних зависимостей
echo "🎤 Упрощение VoiceRecorder..."
cat > src/components/ui/VoiceRecorder.tsx << 'EOF'
import { useState, useRef } from 'react'

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
  const [recordingTime, setRecordingTime] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        }
      })

      const mediaRecorder = new MediaRecorder(stream)
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
      }

      mediaRecorder.start()
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="text-center">
        {!isRecording && !audioUrl && (
          <button
            onClick={startRecording}
            disabled={disabled}
            className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-full transition-colors shadow-lg"
          >
            🎤
          </button>
        )}

        {isRecording && (
          <div className="space-y-4">
            <button
              onClick={stopRecording}
              className="inline-flex items-center justify-center w-16 h-16 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors shadow-lg animate-pulse"
            >
              ⏹️
            </button>
            
            <div className="text-lg font-mono text-gray-700">{formatTime(recordingTime)}</div>
          </div>
        )}

        {audioUrl && !isRecording && (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => {
                  const audio = new Audio(audioUrl)
                  audio.play()
                }}
                className="inline-flex items-center justify-center w-12 h-12 bg-green-600 hover:bg-green-700 text-white rounded-full transition-colors"
              >
                ▶️
              </button>
              
              <button
                onClick={startRecording}
                disabled={disabled}
                className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-full transition-colors"
              >
                🎤
              </button>
            </div>
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

echo ""
echo "✅ ГОТОВО! Language Selector исправлен!"
echo ""
echo "🎯 Что исправлено:"
echo "- ✅ Убраны Heroicons (заменены на SVG)"
echo "- ✅ Исправлен API URL (порт 4000)"
echo "- ✅ Простые select вместо сложных dropdown"
echo "- ✅ Добавлены fallback языки"
echo "- ✅ Улучшена обработка ошибок"
echo "- ✅ Упрощён VoiceRecorder"
echo ""
echo "🌐 СЕЙЧАС LANGUAGE SELECTOR ДОЛЖЕН РАБОТАТЬ!"
echo "Обновите страницу (F5) и проверьте dropdown'ы!"

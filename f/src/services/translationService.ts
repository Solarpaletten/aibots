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

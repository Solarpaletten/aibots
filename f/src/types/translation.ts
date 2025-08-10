export type Language = 
  | 'EN' // English
  | 'RU' // Russian
  | 'DE' // German
  | 'ES' // Spanish
  | 'CS' // Czech
  | 'PL' // Polish
  | 'LT' // Lithuanian
  | 'LV' // Latvian
  | 'NO' // Norwegian

export interface LanguageOption {
  code: Language
  name: string
  flag: string
}

export interface TranslationRequest {
  text?: string
  audioData?: string // Base64 encoded audio
  fromLanguage: Language
  toLanguage: Language
  type: 'TEXT' | 'VOICE' | 'REALTIME_CALL'
}

export interface TranslationResponse {
  originalText: string
  translatedText: string
  translatedAudio?: string // Base64 encoded audio
  fromLanguage: Language
  toLanguage: Language
  processingTime: number
  confidence: number
  sessionId: string
}

export interface TranslationSession {
  id: string
  userId: string
  fromLanguage: Language
  toLanguage: Language
  type: 'TEXT' | 'VOICE' | 'REALTIME_CALL'
  duration?: number
  charactersCount: number
  voiceMinutes: number
  createdAt: string
}

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

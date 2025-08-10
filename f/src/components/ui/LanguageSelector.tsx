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

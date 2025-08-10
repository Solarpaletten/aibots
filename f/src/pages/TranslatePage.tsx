import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mic, MicOff, Volume2, Copy, RotateCcw } from 'lucide-react'

const TranslatePage = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [inputText, setInputText] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [fromLang, setFromLang] = useState('EN')
  const [toLang, setToLang] = useState('RU')

  const languages = [
    { code: 'EN', name: 'English', flag: '🇺🇸' },
    { code: 'RU', name: 'Russian', flag: '🇷🇺' },
    { code: 'DE', name: 'German', flag: '🇩🇪' },
    { code: 'ES', name: 'Spanish', flag: '🇪🇸' },
    { code: 'CS', name: 'Czech', flag: '🇨🇿' },
    { code: 'PL', name: 'Polish', flag: '🇵🇱' },
  ]

  const handleSwapLanguages = () => {
    setFromLang(toLang)
    setToLang(fromLang)
    setInputText(translatedText)
    setTranslatedText(inputText)
  }

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Voice Translator</h1>

        {/* Language Selector */}
        <div className="card mb-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
              <select 
                className="input-field"
                value={fromLang}
                onChange={(e) => setFromLang(e.target.value)}
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <button 
              onClick={handleSwapLanguages}
              className="mx-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <RotateCcw className="w-5 h-5 text-gray-600" />
            </button>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
              <select 
                className="input-field"
                value={toLang}
                onChange={(e) => setToLang(e.target.value)}
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Translation Interface */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Input Side */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Input</h3>
              <button
                onClick={() => setIsRecording(!isRecording)}
                className={`p-3 rounded-full transition-all duration-200 ${
                  isRecording 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'bg-primary-500 text-white hover:bg-primary-600'
                }`}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            </div>
            
            <textarea
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Start typing or click the microphone to record..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />

            <button className="w-full mt-4 btn-primary">
              Translate
            </button>
          </div>

          {/* Output Side */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Translation</h3>
              <div className="flex space-x-2">
                <button className="p-2 rounded-lg hover:bg-gray-100">
                  <Volume2 className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-100">
                  <Copy className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
            
            <div className="w-full h-32 p-3 bg-gray-50 rounded-lg border">
              {translatedText || (
                <span className="text-gray-400">Translation will appear here...</span>
              )}
            </div>
          </div>
        </div>

        {/* Recent Translations */}
        <div className="card mt-8">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Translations</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Hello → Привет</p>
                <p className="text-xs text-gray-400">2 minutes ago</p>
              </div>
              <button className="text-primary-600 hover:text-primary-700">
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default TranslatePage

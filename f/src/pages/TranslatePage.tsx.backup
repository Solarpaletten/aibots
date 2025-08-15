import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import LanguageSelector from '@/components/ui/LanguageSelector'
import VoiceRecorder from '@/components/ui/VoiceRecorder'
import { translationService, TranslationResponse } from '@/services/translationService'
import { SpeakerWaveIcon, ClipboardIcon } from '@heroicons/react/24/outline'
import SmartTextInput from '@/components/SmartTextInput'

const TranslatePage = () => {
  const [fromLanguage, setFromLanguage] = useState('EN')
  const [toLanguage, setToLanguage] = useState('RU')
  const [inputText, setInputText] = useState('')
  const [isTranslating, setIsTranslating] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [result, setResult] = useState<TranslationResponse | null>(null)
  const [activeTab, setActiveTab] = useState<'text' | 'voice'>('text')

//
  const handleSwapLanguages = () => {
    setFromLanguage(toLanguage)
    setToLanguage(fromLanguage)
    if (result) {
      setInputText(result.translatedText)
      setResult(null)
    }
  }

//
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

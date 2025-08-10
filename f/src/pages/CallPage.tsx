import { useState } from 'react'
import { motion } from 'framer-motion'
import { Phone, PhoneOff, Users, Mic, MicOff, Settings } from 'lucide-react'

const CallPage = () => {
  const [isInCall, setIsInCall] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Call Translation</h1>

        {!isInCall ? (
          /* Start Call Interface */
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-xl font-semibold mb-4">Start New Call</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Language
                  </label>
                  <select className="input-field">
                    <option>🇺🇸 English</option>
                    <option>🇷🇺 Russian</option>
                    <option>🇩🇪 German</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Call Topic (Optional)
                  </label>
                  <input 
                    type="text"
                    className="input-field"
                    placeholder="Business meeting, family call, etc."
                  />
                </div>
                <button 
                  className="w-full btn-primary"
                  onClick={() => setIsInCall(true)}
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Start Call
                </button>
              </div>
            </div>

            <div className="card">
              <h3 className="text-xl font-semibold mb-4">Join Existing Call</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Call ID
                  </label>
                  <input 
                    type="text"
                    className="input-field"
                    placeholder="Enter call ID..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Language
                  </label>
                  <select className="input-field">
                    <option>🇺🇸 English</option>
                    <option>🇷🇺 Russian</option>
                    <option>🇩🇪 German</option>
                  </select>
                </div>
                <button className="w-full btn-secondary">
                  <Users className="w-5 h-5 mr-2" />
                  Join Call
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Active Call Interface */
          <div className="space-y-6">
            <div className="card text-center">
              <div className="mb-6">
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold">Call Active</h3>
                <p className="text-gray-600">Real-time translation enabled</p>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-4 rounded-full ${
                    isMuted ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>
                
                <button className="p-4 rounded-full bg-gray-200 text-gray-700">
                  <Settings className="w-6 h-6" />
                </button>
                
                <button
                  onClick={() => setIsInCall(false)}
                  className="p-4 rounded-full bg-red-500 text-white"
                >
                  <PhoneOff className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Participants */}
            <div className="card">
              <h4 className="font-semibold mb-4">Participants</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">U</span>
                    </div>
                    <div>
                      <p className="font-medium">You</p>
                      <p className="text-sm text-gray-600">🇺🇸 English</p>
                    </div>
                  </div>
                  <span className="text-green-500 text-sm">Connected</span>
                </div>
              </div>
            </div>

            {/* Live Translation */}
            <div className="card">
              <h4 className="font-semibold mb-4">Live Translation</h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600">You (English)</p>
                  <p>"Hello, how are you?"</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600">Translation (Russian)</p>
                  <p>"Привет, как дела?"</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default CallPage

import { Link } from 'react-router-dom'

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-6">
            SOLAR Voice Translator
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Real-time AI-powered voice translation that breaks language barriers.
            Translate conversations instantly with natural-sounding voices.
          </p>
          <div className="space-x-4">
            <Link
              to="/app"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
            >
              Start Translating
            </Link>
            <Link
              to="/pricing"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors inline-block"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage

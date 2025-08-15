import { Link } from 'react-router-dom'

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            🌍 DASHKA VOICE TRANSLATOR
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-purple-100">
            AI IT SOLAR v2.0.0
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Real-time AI-powered voice translation that breaks language barriers.
            Translate conversations instantly with natural-sounding voices.
          </p>
          <div className="space-x-4">
            <Link
              to="/app"
              className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors inline-block shadow-lg"
            >
              Start Translating
            </Link>
            <Link
              to="/pricing"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors inline-block"
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

import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  Mic, 
  Phone, 
  Globe, 
  Zap, 
  Shield, 
  Star,
  ArrowRight,
  Play,
  CheckCircle
} from 'lucide-react'

const HomePage = () => {
  const features = [
    {
      icon: <Mic className="w-8 h-8" />,
      title: "Voice-to-Voice Translation",
      description: "Real-time voice translation with natural-sounding AI voices"
    },
    {
      icon: <Phone className="w-8 h-8" />,
      title: "Live Call Translation",
      description: "Translate phone calls in real-time for seamless communication"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "10+ Languages",
      description: "Support for English, Russian, German, Spanish, and more"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Instant Processing",
      description: "Lightning-fast translations powered by advanced AI"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Privacy First",
      description: "End-to-end encryption for all your conversations"
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: "Premium Quality",
      description: "Professional-grade translations for business use"
    }
  ]

  const languages = [
    "🇺🇸 English", "🇷🇺 Russian", "🇩🇪 German", "🇪🇸 Spanish",
    "🇨🇿 Czech", "🇵🇱 Polish", "🇱🇹 Lithuanian", "🇱🇻 Latvian", "🇳🇴 Norwegian"
  ]

  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      period: "/month",
      features: [
        "50 voice minutes/month",
        "Unlimited text translation",
        "10 supported languages",
        "Basic voice quality"
      ],
      cta: "Start Free",
      popular: false
    },
    {
      name: "Premium",
      price: "$9.99",
      period: "/month",
      features: [
        "1000 voice minutes/month",
        "Unlimited text translation",
        "Real-time call translation",
        "HD voice quality",
        "Priority processing"
      ],
      cta: "Upgrade to Premium",
      popular: true
    },
    {
      name: "Business",
      price: "$49.99",
      period: "/month",
      features: [
        "10,000 voice minutes/month",
        "Team management",
        "Conference call translation",
        "API access",
        "Analytics dashboard"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-500 via-primary-600 to-solar-500 overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Break Language Barriers with
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                SOLAR Voice Translator
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-8">
              Real-time AI-powered voice translation that makes global communication effortless
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link 
                to="/register" 
                className="btn-primary bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2 inline" />
              </Link>
              
              <button className="flex items-center gap-2 text-white hover:text-yellow-300 transition-colors">
                <Play className="w-6 h-6" />
                Watch Demo
              </button>
            </div>

            {/* Language Pills */}
            <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
              {languages.map((lang, index) => (
                <motion.span
                  key={lang}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm hover:bg-white/30 transition-colors cursor-pointer"
                >
                  {lang}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose SOLAR?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Advanced AI technology meets intuitive design for the ultimate translation experience
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card hover:shadow-lg transition-shadow duration-300 group cursor-pointer"
              >
                <div className="text-primary-600 mb-4 group-hover:scale-110 transition-transform duration-200">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              SOLAR vs Competition
            </h2>
            <p className="text-xl text-gray-600">
              See why thousands choose SOLAR for their translation needs
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="grid md:grid-cols-3 gap-8 p-8">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-500 mb-4">Other Apps</h3>
                <ul className="space-y-3 text-gray-600">
                  <li>❌ Separate app download required</li>
                  <li>❌ Limited language support</li>
                  <li>❌ High subscription costs</li>
                  <li>❌ No real-time group calls</li>
                  <li>❌ Poor voice quality</li>
                </ul>
              </div>

              <div className="text-center border-l border-r border-gray-200 px-8 bg-gradient-to-b from-primary-50 to-solar-50 rounded-lg">
                <h3 className="text-lg font-semibold text-primary-600 mb-4">SOLAR</h3>
                <ul className="space-y-3 text-gray-900">
                  <li className="flex items-center gap-2 justify-center">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Works in Telegram & Web
                  </li>
                  <li className="flex items-center gap-2 justify-center">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    10+ languages supported
                  </li>
                  <li className="flex items-center gap-2 justify-center">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Free tier + affordable plans
                  </li>
                  <li className="flex items-center gap-2 justify-center">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Group call translation
                  </li>
                  <li className="flex items-center gap-2 justify-center">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    AI-powered natural voices
                  </li>
                </ul>
              </div>

              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-500 mb-4">Built-in Solutions</h3>
                <ul className="space-y-3 text-gray-600">
                  <li>❌ Limited to specific devices</li>
                  <li>❌ Basic translation quality</li>
                  <li>❌ No customization</li>
                  <li>❌ Privacy concerns</li>
                  <li>❌ No business features</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the perfect plan for your translation needs
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`card relative ${
                  plan.popular 
                    ? 'ring-2 ring-primary-500 shadow-lg scale-105' 
                    : 'hover:shadow-lg'
                } transition-all duration-300`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Link
                    to="/register"
                    className={`w-full inline-block text-center py-3 px-6 rounded-lg font-semibold transition-colors ${
                      plan.popular
                        ? 'bg-primary-600 text-white hover:bg-primary-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary-600 to-solar-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Break Down Language Barriers?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of users who trust SOLAR for their translation needs. 
              Start your free trial today and experience the future of communication.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="btn-primary bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2 inline" />
              </Link>
              <Link
                to="/pricing"
                className="px-8 py-4 text-lg font-semibold text-white border-2 border-white rounded-xl hover:bg-white hover:text-primary-600 transition-all duration-200"
              >
                View Pricing
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">SOLAR</h3>
              <p className="text-gray-400">
                Breaking language barriers with AI-powered voice translation.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="/api" className="hover:text-white transition-colors">API</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link to="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 SOLAR Voice Translator. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
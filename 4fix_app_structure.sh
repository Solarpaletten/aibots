#!/bin/bash

echo "🔧 Исправление структуры приложения для правильных папок..."

cd f/

# Создаем AppRouter в правильном месте
echo "📝 Создание AppRouter.tsx в src/app/"
cat > src/app/AppRouter.tsx << 'EOF'
import { Routes, Route } from 'react-router-dom'
import { motion } from 'framer-motion'

// Layout
import Layout from '@/components/layout/Layout'

// Pages
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import DashboardPage from '@/pages/DashboardPage'
import TranslatePage from '@/pages/TranslatePage'
import CallPage from '@/pages/CallPage'
import ProfilePage from '@/pages/ProfilePage'
import PricingPage from '@/pages/PricingPage'

// Components
import ProtectedRoute from '@/components/ui/ProtectedRoute'
import ErrorBoundary from '@/components/ui/ErrorBoundary'

// Hooks
import { useAuthStore } from '@/hooks/useAuth'

const AppRouter = () => {
  const { user, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 to-solar-500 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-white text-xl font-semibold">Loading SOLAR...</h2>
        </motion.div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="pricing" element={<PricingPage />} />
          </Route>

          {/* Protected Routes */}
          <Route path="/app" element={
            <ProtectedRoute>
              <Layout showSidebar={true} />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardPage />} />
            <Route path="translate" element={<TranslatePage />} />
            <Route path="call" element={<CallPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* 404 Page */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-900">404</h1>
                <p className="text-xl text-gray-600 mt-4">Page not found</p>
                <a 
                  href="/" 
                  className="btn-primary mt-6 inline-block"
                >
                  Go Home
                </a>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </ErrorBoundary>
  )
}

export default AppRouter
EOF

# Обновляем main.tsx чтобы использовать AppRouter
echo "📝 Обновление main.tsx для использования AppRouter..."
cat > src/main.tsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'

import AppRouter from './app/AppRouter'
import './index.css'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: false,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRouter />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              style: {
                background: '#10B981',
              },
            },
            error: {
              style: {
                background: '#EF4444',
              },
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
EOF

# Создаем дополнительные компоненты в src/app/
echo "📝 Создание дополнительных компонентов в src/app/..."

cat > src/app/AppProvider.tsx << 'EOF'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast'

interface AppProviderProps {
  children: React.ReactNode
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: false,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
})

const AppProvider = ({ children }: AppProviderProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            style: {
              background: '#10B981',
            },
          },
          error: {
            style: {
              background: '#EF4444',
            },
          },
        }}
      />
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}

export default AppProvider
EOF

cat > src/app/App.tsx << 'EOF'
import { BrowserRouter } from 'react-router-dom'
import AppProvider from './AppProvider'
import AppRouter from './AppRouter'

const App = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </AppProvider>
  )
}

export default App
EOF

# Обновляем main.tsx для использования App из app/
echo "📝 Финальное обновление main.tsx..."
cat > src/main.tsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
EOF

# Создаем дополнительные страницы в правильных местах
echo "📝 Создание недостающих страниц..."

cat > src/pages/TranslatePage.tsx << 'EOF'
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
EOF

cat > src/pages/CallPage.tsx << 'EOF'
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
EOF

cat > src/pages/ProfilePage.tsx << 'EOF'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/hooks/useAuth'
import { User, Mail, Calendar, CreditCard } from 'lucide-react'

const ProfilePage = () => {
  const { user } = useAuthStore()

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile Settings</h1>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="card">
              <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input 
                    type="text"
                    className="input-field"
                    defaultValue={user?.name}
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input 
                    type="email"
                    className="input-field"
                    defaultValue={user?.email}
                    disabled
                  />
                </div>
                <button className="btn-primary">
                  Save Changes
                </button>
              </div>
            </div>

            <div className="card">
              <h3 className="text-xl font-semibold mb-4">Subscription</h3>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{user?.subscriptionTier} Plan</p>
                  <p className="text-sm text-gray-600">
                    {user?.subscriptionTier === 'FREE' && 'Upgrade to unlock more features'}
                    {user?.subscriptionTier === 'PREMIUM' && 'Enjoy premium features'}
                    {user?.subscriptionTier === 'BUSINESS' && 'Full business access'}
                  </p>
                </div>
                <button className="btn-secondary">
                  {user?.subscriptionTier === 'FREE' ? 'Upgrade' : 'Manage'}
                </button>
              </div>
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Account Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Member since</p>
                    <p className="font-medium">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email verified</p>
                    <p className="font-medium text-green-600">✓ Verified</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Voice minutes used</p>
                    <p className="font-medium">{user?.voiceMinutesUsed || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full btn-secondary text-left">
                  Download Data
                </button>
                <button className="w-full btn-secondary text-left">
                  Reset Password
                </button>
                <button className="w-full text-red-600 hover:bg-red-50 py-2 px-4 rounded-lg transition-colors text-left">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default ProfilePage
EOF

cat > src/pages/PricingPage.tsx << 'EOF'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { CheckCircle, ArrowRight } from 'lucide-react'

const PricingPage = () => {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "/month",
      description: "Perfect for trying out SOLAR",
      features: [
        "50 voice minutes/month",
        "Unlimited text translation",
        "10 supported languages",
        "Basic voice quality",
        "Email support"
      ],
      cta: "Start Free",
      popular: false,
      color: "gray"
    },
    {
      name: "Premium",
      price: "$9.99",
      period: "/month",
      description: "Best for individuals and small teams",
      features: [
        "1,000 voice minutes/month",
        "Unlimited text translation",
        "Real-time call translation",
        "HD voice quality",
        "Priority processing",
        "Custom voice selection",
        "Priority support"
      ],
      cta: "Upgrade to Premium",
      popular: true,
      color: "primary"
    },
    {
      name: "Business",
      price: "$49.99",
      period: "/month",
      description: "For teams and organizations",
      features: [
        "10,000 voice minutes/month",
        "Unlimited text translation",
        "Team management",
        "Conference call translation",
        "API access",
        "Analytics dashboard",
        "Custom integrations",
        "24/7 dedicated support"
      ],
      cta: "Contact Sales",
      popular: false,
      color: "solar"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the perfect plan for your translation needs. 
            Upgrade or downgrade at any time.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`card relative ${
                plan.popular 
                  ? 'ring-2 ring-primary-500 shadow-xl scale-105' 
                  : 'hover:shadow-lg'
              } transition-all duration-300`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary-500 text-white px-6 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                
                <div className="mb-6">
                  <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600 text-lg">{plan.period}</span>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-left">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link
                  to="/register"
                  className={`w-full inline-flex items-center justify-center py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                    plan.popular
                      ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg hover:shadow-xl'
                      : plan.color === 'solar'
                      ? 'bg-solar-500 text-white hover:bg-solar-600'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-20"
        >
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I change my plan at any time?
              </h3>
              <p className="text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, 
                and we'll prorate any charges or credits.
              </p>
            </div>
            
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What happens if I exceed my voice minutes?
              </h3>
              <p className="text-gray-600">
                If you exceed your monthly voice minutes, you'll be prompted to upgrade your plan. 
                Text translations remain unlimited on all plans.
              </p>
            </div>
            
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Is there a free trial for paid plans?
              </h3>
              <p className="text-gray-600">
                Yes! All paid plans come with a 7-day free trial. You can cancel anytime during 
                the trial period without being charged.
              </p>
            </div>
            
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Do you offer enterprise pricing?
              </h3>
              <p className="text-gray-600">
                Absolutely! For organizations with specific needs or high-volume usage, 
                we offer custom enterprise plans. Contact our sales team for more information.
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-20"
        >
          <div className="bg-gradient-to-r from-primary-500 to-solar-500 rounded-2xl p-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to break language barriers?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of users who trust SOLAR for their translation needs. 
              Start your free trial today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="btn-primary bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2 inline" />
              </Link>
              <Link
                to="/contact"
                className="px-8 py-4 text-lg font-semibold text-white border-2 border-white rounded-xl hover:bg-white hover:text-primary-600 transition-all duration-200"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default PricingPage
EOF

# Создаем дополнительные типы для приложения
echo "📝 Создание типов в src/types/..."
cat > src/types/auth.ts << 'EOF'
export interface User {
  id: string
  email: string
  name?: string
  subscriptionTier: 'FREE' | 'PREMIUM' | 'BUSINESS'
  voiceMinutesUsed: number
  apiKeysUsed: number
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  success: boolean
  data: {
    user: User
    token: string
    expiresIn: string
  }
  message?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name?: string
}
EOF

cat > src/types/translation.ts << 'EOF'
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
EOF

cat > src/types/api.ts << 'EOF'
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  timestamp: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface ApiError {
  code: string
  message: string
  details?: any
  timestamp: string
}
EOF

# Создаем дополнительные утилиты
echo "📝 Создание утилит в src/utils/..."
cat > src/utils/constants.ts << 'EOF'
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
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v2',
  socketUrl: import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001',
}
EOF

cat > src/utils/helpers.ts << 'EOF'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function truncateText(text: string, length: number): string {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c == 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}
EOF

echo "✅ Структура приложения исправлена!"
echo ""
echo "📁 Что создано в правильных местах:"
echo "- ✅ src/app/AppRouter.tsx - Основной роутер"
echo "- ✅ src/app/AppProvider.tsx - Провайдеры"
echo "- ✅ src/app/App.tsx - Главное приложение"
echo "- ✅ src/pages/ - Все страницы (Translate, Call, Profile, Pricing)"
echo "- ✅ src/types/ - TypeScript типы"
echo "- ✅ src/utils/ - Утилиты и константы"
echo ""
echo "🚀 Теперь структура соответствует вашей папке app/!"
echo ""
echo "Выполните:"
echo "npm install"
echo "npm run dev"
                
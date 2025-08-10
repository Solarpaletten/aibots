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

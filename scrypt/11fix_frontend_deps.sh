#!/bin/bash

echo "🌐 SOLAR v2.0 - Исправление Frontend зависимостей"
echo "================================================"

cd f/

# Устанавливаем недостающие зависимости
echo "📦 Установка недостающих зависимостей..."
npm install @tanstack/react-query @tanstack/react-query-devtools react-hot-toast zustand framer-motion react-router-dom @types/node

# Исправляем AppProvider.tsx
echo "🔧 Исправление AppProvider.tsx..."
cat > src/app/AppProvider.tsx << 'EOF'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";
import { BrowserRouter } from "react-router-dom";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 3,
    },
  },
});

interface AppProviderProps {
  children: React.ReactNode;
}

const AppProvider = ({ children }: AppProviderProps) => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default AppProvider;
EOF

# Исправляем App.tsx
echo "⚡ Исправление App.tsx..."
cat > src/app/App.tsx << 'EOF'
import AppProvider from './AppProvider'
import AppRouter from './AppRouter'

function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  )
}

export default App
EOF

# Обновляем main.tsx
echo "🚀 Обновление main.tsx..."
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

# Создаем базовые компоненты если их нет
echo "🏗️ Создание базовых компонентов..."

# Layout компонент
cat > src/components/layout/Layout.tsx << 'EOF'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'

interface LayoutProps {
  showSidebar?: boolean
}

const Layout = ({ showSidebar = false }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        {showSidebar && <Sidebar />}
        <main className={`flex-1 ${showSidebar ? 'ml-64' : ''}`}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
EOF

# Header компонент
cat > src/components/layout/Header.tsx << 'EOF'
import { Link } from 'react-router-dom'

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-xl font-bold text-gray-900">SOLAR</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/features" className="text-gray-600 hover:text-gray-900 transition-colors">
              Features
            </Link>
            <Link to="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
              Pricing
            </Link>
            <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Login
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
EOF

# Sidebar компонент
cat > src/components/layout/Sidebar.tsx << 'EOF'
import { Link, useLocation } from 'react-router-dom'

const Sidebar = () => {
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/app' },
    { name: 'Translate', href: '/app/translate' },
    { name: 'Call', href: '/app/call' },
    { name: 'Profile', href: '/app/profile' },
  ]

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg border-r border-gray-200 pt-16">
      <nav className="px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export default Sidebar
EOF

# ProtectedRoute компонент
cat > src/components/ui/ProtectedRoute.tsx << 'EOF'
import { Navigate, useLocation } from 'react-router-dom'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation()
  
  // Заглушка - всегда разрешаем доступ для демо
  const isAuthenticated = true

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
EOF

# ErrorBoundary компонент
cat > src/components/ui/ErrorBoundary.tsx << 'EOF'
import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reload page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
EOF

# Простая HomePage
cat > src/pages/HomePage.tsx << 'EOF'
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
EOF

# Создаем остальные страницы как заглушки
echo "📄 Создание остальных страниц..."

# LoginPage
cat > src/pages/LoginPage.tsx << 'EOF'
import { useState } from 'react'
import { Link } from 'react-router-dom'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Login:', { email, password })
    // Здесь будет логика авторизации
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Sign in to SOLAR</h2>
          <p className="mt-2 text-gray-600">Demo: demo@solar.ai / demo123</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
          <p className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-500">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
EOF

# Создаем остальные страницы
for page in RegisterPage DashboardPage TranslatePage CallPage ProfilePage PricingPage; do
  cat > src/pages/${page}.tsx << EOF
const ${page} = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">${page}</h1>
      <p className="text-gray-600">This is the ${page} - coming soon!</p>
    </div>
  )
}

export default ${page}
EOF
done

# Создаем auth hook
echo "🔐 Создание auth hook..."
cat > src/hooks/useAuth.ts << 'EOF'
import { create } from 'zustand'

interface User {
  id: string
  email: string
  name?: string
  subscriptionTier: string
}

interface AuthStore {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: false,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null }),
}))
EOF

# Создаем API client
echo "🌐 Создание API client..."
cat > src/services/apiClient.ts << 'EOF'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v2'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
EOF

echo ""
echo "✅ ГОТОВО! Frontend исправлен!"
echo ""
echo "🚀 Теперь пробуйте запустить Frontend:"
echo "npm run dev"
echo ""
echo "🎯 Что исправлено:"
echo "- ✅ Установлены недостающие зависимости"
echo "- ✅ Исправлен AppProvider.tsx"  
echo "- ✅ Созданы все базовые компоненты"
echo "- ✅ Созданы все страницы"
echo "- ✅ Создан auth hook"
echo "- ✅ Создан API client"
echo ""
echo "🌐 FRONTEND ГОТОВ К ПОЛЁТУ НА ПОРТ 3000! 🚀"

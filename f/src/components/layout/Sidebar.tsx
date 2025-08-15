// src/components/layout/Sidebar.tsx
import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

const Sidebar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/app',
      icon: '📊',
      iconSvg: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        </svg>
      )
    },
    { 
      name: 'Translate', 
      href: '/app/translate',
      icon: '🌐',
      iconSvg: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m5 8 6 6m-7 0 6.5-6.5M12 3v18m0-9h9" />
        </svg>
      )
    },
    { 
      name: 'Call', 
      href: '/app/call',
      icon: '📞',
      iconSvg: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 0 1 2-2h3.28a1 1 0 0 1 .948.684l1.498 4.493a1 1 0 0 1-.502 1.21l-2.257 1.13a11.042 11.042 0 0 0 5.516 5.516l1.13-2.257a1 1 0 0 1 1.21-.502l4.493 1.498a1 1 0 0 1 .684.949V19a2 2 0 0 1-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      )
    },
    { 
      name: 'Profile', 
      href: '/app/profile',
      icon: '👤',
      iconSvg: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z" />
        </svg>
      )
    },
  ]

  // Auto-close menu on route change (mobile)
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  // Handle escape key and body scroll lock
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])

  // Icons Components
  const HamburgerIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )

  const CloseIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )

  return (
    <>
      {/* Desktop Sidebar - Traditional Layout */}
      <div className="hidden md:block fixed inset-y-0 left-0 w-64 bg-white shadow-lg border-r border-gray-200 pt-16 z-30">
        <nav className="px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {item.iconSvg}
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>
        
        {/* Desktop Footer */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <div className="flex items-center justify-center space-x-2 mb-1">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">S</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">SOLAR</span>
            </div>
            <p className="text-xs text-gray-500">Voice Translator v2.0</p>
          </div>
        </div>
      </div>

      {/* Mobile Hamburger Button - Fixed Top-Left */}
      <button
        onClick={() => setIsMenuOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-white rounded-lg shadow-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
        aria-label="Open navigation menu"
      >
        <HamburgerIcon />
      </button>

      {/* Mobile Full-Screen Menu Overlay */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Full-Screen Menu */}
          <div className="md:hidden fixed inset-0 bg-white z-50 flex flex-col animate-slide-in">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">SOLAR</h1>
                  <p className="text-sm text-gray-600">Voice Translator</p>
                </div>
              </div>
              
              <button
                onClick={() => setIsMenuOpen(false)}
                className="w-10 h-10 rounded-full bg-white bg-opacity-80 flex items-center justify-center hover:bg-opacity-100 transition-colors shadow-sm"
                aria-label="Close menu"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 px-6 py-8 space-y-3 overflow-y-auto">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-4 px-6 py-4 rounded-xl transition-all ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 border-2 border-blue-100 shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border-2 border-transparent'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <span className="text-lg font-medium">{item.name}</span>
                      {isActive && (
                        <div className="text-sm text-blue-500 font-medium">Current</div>
                      )}
                    </div>
                  </Link>
                )
              })}
            </nav>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">Version 2.0</p>
                <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
                  <span>AI-Powered Translation</span>
                  <span>•</span>
                  <span>Real-time Voice</span>
                </div>
                <p className="text-xs text-gray-400 mt-2">Tap outside to close</p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default Sidebar
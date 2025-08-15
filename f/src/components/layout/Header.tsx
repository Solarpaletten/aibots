import { Link } from 'react-router-dom'

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg border-b border-purple-300 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-purple-600 font-bold text-lg">🌍</span>
            </div>
            <span className="text-xl font-bold text-white">
              DASHKA VOICE TRANSLATOR AI IT SOLAR
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/features" className="text-purple-100 hover:text-white transition-colors">
              Features
            </Link>
            <Link to="/pricing" className="text-purple-100 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link to="/login" className="bg-white text-purple-600 px-6 py-2 rounded-lg hover:bg-purple-50 transition-colors font-semibold">
              Login
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header

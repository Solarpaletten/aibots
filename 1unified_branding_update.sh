#!/bin/bash

echo "🎨 DASHKA VOICE TRANSLATOR - Обновление брендинга..."
echo "=================================================="

# 1. Обновляем Header
echo "📝 Обновляем Header компонент..."
cat > f/src/components/layout/Header.tsx << 'EOF'
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
EOF

# 2. Обновляем HomePage
echo "🏠 Обновляем HomePage..."
cat > f/src/pages/HomePage.tsx << 'EOF'
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
EOF

# 3. Обновляем Title в HTML
echo "📄 Обновляем HTML title..."
sed -i.backup 's/<title>.*<\/title>/<title>DASHKA Voice Translator - AI IT SOLAR v2.0.0<\/title>/' f/index.html
sed -i.backup 's/content=".*Voice Translator.*"/content="DASHKA Voice Translator AI IT SOLAR - Real-time AI-powered translation"/' f/index.html
sed -i.backup 's/content="#3B82F6"/content="#7C3AED"/' f/index.html

# 4. Находим и обновляем заголовок в TranslatePage
echo "📱 Обновляем TranslatePage заголовок..."
if [ -f "f/src/pages/TranslatePage.tsx" ]; then
    # Создаем backup
    cp f/src/pages/TranslatePage.tsx f/src/pages/TranslatePage.tsx.backup

    # Обновляем заголовок
    sed -i.backup 's/<h1 className="text-3xl.*">.*<\/h1>/<h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2 flex items-center justify-center gap-3">🌍 DASHKA VOICE TRANSLATOR<\/h1>/' f/src/pages/TranslatePage.tsx
    
    echo "✅ TranslatePage заголовок обновлен"
else
    echo "⚠️  TranslatePage.tsx не найден"
fi

echo ""
echo "✅ БРЕНДИНГ ОБНОВЛЕН УСПЕШНО!"
echo "🎨 Цветовая схема: Purple-Blue градиент"
echo "🌍 Брендинг: DASHKA VOICE TRANSLATOR AI IT SOLAR"
echo "📱 Все компоненты обновлены"
echo ""
echo "🚀 Перезапустите frontend:"
echo "cd f && npm run dev"
echo ""
echo "🏆 ГОТОВО К APP STORE! 🏆"
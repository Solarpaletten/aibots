#!/bin/bash

echo "🔍 ПРОВЕРКА ФАЙЛОВ ПЕРЕД ОТПРАВКОЙ В GITHUB"
echo "==========================================="

# Копируем идеальный .gitignore
echo "📝 Создание идеального .gitignore..."
cp /dev/stdin > .gitignore << 'EOF'
# 📦 Dependencies (ГЛАВНОЕ!)
node_modules/
*/node_modules/
**/node_modules/

# 🔐 Environment variables & Secrets
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
*.key
*.pem

# 🏗️ Build outputs
dist/
build/
*/dist/
*/build/

# 📋 Logs
*.log
logs/
npm-debug.log*

# 🗄️ Database
*.db
*.sqlite

# 🔧 Editor & OS files
.vscode/*
.idea/
.DS_Store
Thumbs.db

# 🎯 Project specific
uploads/*
!uploads/.gitkeep
cache/
.cache/

# 📦 Backup files
*.backup
*.bak
*.old
EOF

echo "✅ .gitignore создан!"
echo ""

# Удаляем все что не должно попасть в git
echo "🧹 Очистка ненужных файлов..."

# Удаляем node_modules если есть
if [ -d "node_modules" ]; then
    echo "🗑️  Удаляем корневой node_modules"
    rm -rf node_modules
fi

if [ -d "b/node_modules" ]; then
    echo "🗑️  Удаляем b/node_modules"
    rm -rf b/node_modules
fi

if [ -d "f/node_modules" ]; then
    echo "🗑️  Удаляем f/node_modules"
    rm -rf f/node_modules
fi

# Удаляем .env файлы с секретами
echo "🔐 Очистка секретных файлов..."
find . -name ".env" -not -name ".env.example" -delete
find . -name "*.key" -delete
find . -name "*.log" -delete

# Создаем безопасные .env.example файлы
echo "📝 Создание безопасных .env.example..."

cat > b/.env.example << 'EOF'
# Server Configuration
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/solar_translator"

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="24h"

# OpenAI API (получите на https://platform.openai.com)
OPENAI_API_KEY="your-openai-api-key-here"

# Redis Cache
REDIS_URL="redis://localhost:6379"

# CORS
CORS_ORIGIN="http://localhost:3000"
EOF

cat > f/.env.example << 'EOF'
# API Configuration
VITE_API_URL=http://localhost:3001/api/v2
VITE_SOCKET_URL=http://localhost:3001

# App Configuration
VITE_APP_NAME="SOLAR Voice Translator"
VITE_APP_VERSION=2.0.0
EOF

echo "✅ Безопасные .env.example созданы!"
echo ""

# Проверяем что будет отправлено
echo "🔍 ПРОВЕРКА: Что будет отправлено в GitHub?"
echo "============================================"

# Показываем размер
echo "📊 Общий размер файлов:"
du -sh . 2>/dev/null | head -1

echo ""
echo "📁 Структура файлов которая будет отправлена:"
git ls-files 2>/dev/null || find . -type f ! -path "./.git/*" ! -path "./node_modules/*" ! -path "./*/node_modules/*" ! -name "*.log" ! -name ".DS_Store" | head -50

echo ""
echo "🔍 Проверка на опасные файлы:"

# Проверяем нет ли node_modules
if find . -name "node_modules" -type d | grep -q .; then
    echo "❌ ВНИМАНИЕ: Найдены папки node_modules!"
    find . -name "node_modules" -type d
else
    echo "✅ node_modules не найдены"
fi

# Проверяем нет ли .env файлов
if find . -name ".env" ! -name ".env.example" | grep -q .; then
    echo "❌ ВНИМАНИЕ: Найдены .env файлы с секретами!"
    find . -name ".env" ! -name ".env.example"
else
    echo "✅ Секретные .env файлы не найдены"
fi

# Проверяем нет ли API ключей
if grep -r "sk-proj-" . 2>/dev/null | grep -v ".git" | head -5; then
    echo "❌ ВНИМАНИЕ: Найдены API ключи!"
else
    echo "✅ API ключи не найдены"
fi

# Проверяем размер файлов
echo ""
echo "📊 Самые большие файлы:"
find . -type f ! -path "./.git/*" ! -path "./node_modules/*" ! -path "./*/node_modules/*" -exec du -h {} + 2>/dev/null | sort -hr | head -10

echo ""
echo "🎯 ИТОГОВАЯ ПРОВЕРКА:"
echo "===================="

file_count=$(find . -type f ! -path "./.git/*" ! -path "./node_modules/*" ! -path "./*/node_modules/*" | wc -l)
echo "📁 Количество файлов: $file_count"

if [ $file_count -lt 200 ]; then
    echo "✅ Количество файлов в норме"
else
    echo "⚠️  Много файлов, проверьте нет ли лишнего"
fi

echo ""
echo "🚀 ГОТОВО К ОТПРАВКЕ?"
echo "==================="
echo "✅ Если все проверки прошли - можно делать git add и push"
echo "❌ Если есть проблемы - исправьте их перед отправкой"
echo ""
echo "📋 Следующие команды для отправки:"
echo "git add ."
echo "git commit -m '🚀 SOLAR v2.0 - Clean initial commit'"
echo "git push -u origin main"
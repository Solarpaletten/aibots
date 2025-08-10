#!/bin/bash

echo "🚀 SOLAR v2.0 - Быстрая очистка проекта"
echo "======================================"

# 1. Создаем идеальный .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
*/node_modules/
**/node_modules/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
*.env

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock
.DS_Store
*.tgz
*.tar.gz

# Coverage directory used by tools like istanbul
coverage/
*.lcov
.nyc_output

# Build outputs
dist/
build/
*.map

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Package locks (keep only one)
package-lock.js

# Database
*.sqlite
*.sqlite3

# API Keys and Secrets
*.key
*.pem
config/secrets.js
**/openai-key.txt

# Uploads
uploads/
temp/
EOF

echo "✅ .gitignore создан"

# 2. Удаляем все node_modules папки
echo "🗑️ Удаление node_modules..."
find . -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true

# 3. Удаляем .env файлы с секретами
echo "🔒 Очистка секретов..."
find . -name ".env" -not -path "./.env.example" -delete 2>/dev/null || true

# 4. Удаляем временные файлы
echo "🧹 Удаление временных файлов..."
find . -name ".DS_Store" -delete 2>/dev/null || true
find . -name "*.log" -delete 2>/dev/null || true
find . -name "package-lock.js" -delete 2>/dev/null || true

# 5. Создаем безопасные .env.example файлы
echo "📝 Создание безопасных .env.example..."

cat > b/.env.example << 'EOF'
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/solar_db"

# API Keys (replace with your actual keys)
OPENAI_API_KEY="your-openai-api-key-here"
TELEGRAM_BOT_TOKEN="your-telegram-bot-token-here"

# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-here"

# CORS Origin
CORS_ORIGIN="http://localhost:3000"
EOF

cat > f/.env.example << 'EOF'
# Backend API URL
VITE_API_URL="http://localhost:3001"

# Environment
VITE_NODE_ENV=development

# App Configuration
VITE_APP_NAME="SOLAR Translator"
VITE_APP_VERSION="2.0.0"
EOF

echo "✅ Безопасные .env.example созданы"

# 6. Проверяем что получилось
echo ""
echo "🔍 ФИНАЛЬНАЯ ПРОВЕРКА:"
echo "====================="

# Подсчитываем файлы
FILE_COUNT=$(find . -type f | wc -l | tr -d ' ')
echo "📁 Количество файлов: $FILE_COUNT"

# Проверяем node_modules
if find . -name "node_modules" -type d | head -1 | grep -q node_modules; then
    echo "❌ ВНИМАНИЕ: node_modules все еще есть!"
else
    echo "✅ node_modules успешно удалены"
fi

# Проверяем .env файлы
ENV_COUNT=$(find . -name ".env" -not -name "*.example" | wc -l | tr -d ' ')
if [ "$ENV_COUNT" -gt 0 ]; then
    echo "❌ ВНИМАНИЕ: Найдены .env файлы с секретами!"
    find . -name ".env" -not -name "*.example"
else
    echo "✅ Секретные .env файлы удалены"
fi

# Показываем размер проекта
TOTAL_SIZE=$(du -sh . | cut -f1)
echo "💾 Общий размер проекта: $TOTAL_SIZE"

echo ""
echo "🎯 ФАЙЛЫ ДЛЯ ОТПРАВКИ В GITHUB:"
echo "=============================="
git status --porcelain 2>/dev/null | head -20 || echo "Git не инициализирован"

echo ""
echo "🚀 ГОТОВО! Теперь можно отправлять в GitHub:"
echo "git add ."
echo "git commit -m '🚀 SOLAR v2.0 - Clean professional setup'"
echo "git push -u origin main"

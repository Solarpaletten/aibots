# 🚀 ПРОСТЫЕ СКРИПТЫ ДЛЯ ЗАПУСКА SOLAR v2.0

# ======================================
# 1. СКРИПТ ЗАПУСКА BACKEND (start-backend.sh)
# ======================================
#!/bin/bash
echo "🔥 Запуск SOLAR Backend на порту 4000..."

# Переходим в папку backend
cd b/

# Устанавливаем зависимости если нужно
if [ ! -d "node_modules" ]; then
    echo "📦 Установка зависимостей..."
    npm install
fi

# Создаем .env если нет
if [ ! -f ".env" ]; then
    echo "📝 Создание .env файла..."
    cp .env.example .env
fi

# Запускаем сервер
echo "🚀 Запуск сервера..."
npm run dev

# ======================================
# 2. СКРИПТ ЗАПУСКА FRONTEND (start-frontend.sh)  
# ======================================
#!/bin/bash
echo "🎨 Запуск SOLAR Frontend на порту 3000..."

# Переходим в папку frontend
cd f/

# Устанавливаем зависимости если нужно
if [ ! -d "node_modules" ]; then
    echo "📦 Установка зависимостей..."
    npm install
fi

# Создаем .env если нет
if [ ! -f ".env" ]; then
    echo "📝 Создание .env файла..."
    cat > .env << EOF
VITE_API_URL=http://localhost:4000/api/v2
VITE_SOCKET_URL=http://localhost:4000
VITE_NODE_ENV=development
VITE_APP_NAME="SOLAR Translator"
VITE_APP_VERSION="2.0.0"
EOF
fi

# Запускаем сервер
echo "🚀 Запуск сервера..."
npm run dev

# ======================================
# 3. ОБЩИЙ СКРИПТ УСТАНОВКИ (install.sh)
# ======================================
#!/bin/bash
echo "📦 Установка зависимостей SOLAR v2.0..."

# Backend
echo "🔧 Backend..."
cd b/ && npm install

# Frontend  
echo "🎨 Frontend..."
cd ../f/ && npm install

echo "✅ Установка завершена!"
echo ""
echo "🚀 Для запуска:"
echo "  Backend:  cd b && npm run dev"
echo "  Frontend: cd f && npm run dev"

# ======================================
# 4. СКРИПТ ПОЛНОГО ЗАПУСКА (start-all.sh)
# ======================================
#!/bin/bash
echo "🚀 SOLAR v2.0 - Полный запуск"

# Устанавливаем зависимости
echo "📦 Проверка зависимостей..."
cd b/ && npm install --silent
cd ../f/ && npm install --silent

# Настраиваем .env файлы
echo "🔧 Настройка environment..."
if [ ! -f "b/.env" ]; then
    cp b/.env.example b/.env
fi

if [ ! -f "f/.env" ]; then
    cat > f/.env << EOF
VITE_API_URL=http://localhost:4000/api/v2
VITE_SOCKET_URL=http://localhost:4000
VITE_NODE_ENV=development
EOF
fi

# Запускаем в фоне
echo "🔥 Запуск Backend..."
cd b/ && npm run dev &

echo "⏳ Ожидание 3 секунды..."
sleep 3

echo "🎨 Запуск Frontend..."
cd ../f/ && npm run dev &

echo ""
echo "✅ SOLAR v2.0 запущен!"
echo "🌐 Frontend: http://localhost:3000"
echo "🖥️  Backend:  http://localhost:4000"
echo ""
echo "Нажмите Ctrl+C для остановки"
wait

# ======================================
# 5. WINDOWS BAT ФАЙЛЫ
# ======================================

# start-backend.bat
@echo off
echo 🔥 Запуск SOLAR Backend...
cd b
if not exist node_modules npm install
if not exist .env copy .env.example .env
npm run dev

# start-frontend.bat  
@echo off
echo 🎨 Запуск SOLAR Frontend...
cd f
if not exist node_modules npm install
if not exist .env (
echo VITE_API_URL=http://localhost:4000/api/v2 > .env
echo VITE_SOCKET_URL=http://localhost:4000 >> .env
echo VITE_NODE_ENV=development >> .env
)
npm run dev

# install.bat
@echo off
echo 📦 Установка SOLAR v2.0...
cd b && npm install
cd ../f && npm install
echo ✅ Установка завершена!
pause

# ======================================
# 6. PACKAGE.JSON SCRIPTS (для корневой папки)
# ======================================
{
  "name": "solar-v2-workspace",
  "version": "2.0.0",
  "scripts": {
    "install:all": "cd b && npm install && cd ../f && npm install",
    "dev:backend": "cd b && npm run dev",
    "dev:frontend": "cd f && npm run dev", 
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "build:backend": "cd b && npm run build",
    "build:frontend": "cd f && npm run build",
    "build": "npm run build:backend && npm run build:frontend",
    "start:backend": "cd b && npm start",
    "start:frontend": "cd f && npm run preview",
    "start": "concurrently \"npm run start:backend\" \"npm run start:frontend\"",
    "test": "cd b && npm test && cd ../f && npm test"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}

# ======================================
# 7. DOCKER COMPOSE (опционально)
# ======================================
version: '3.8'
services:
  backend:
    build: ./b
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=development
      - PORT=4000
    volumes:
      - ./b:/app
      - /app/node_modules

  frontend:
    build: ./f  
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://localhost:4000/api/v2
    volumes:
      - ./f:/app
      - /app/node_modules
    depends_on:
      - backend

# ======================================
# 8. КОМАНДЫ ДЛЯ БЫСТРОГО СТАРТА
# ======================================

# Одной командой (если установлен concurrently):
npm install -g concurrently
concurrently "cd b && npm run dev" "cd f && npm run dev"

# Или в двух терминалах:
# Терминал 1:
cd b && npm install && npm run dev

# Терминал 2:  
cd f && npm install && npm run dev

# ======================================
# 9. ПРОВЕРКА ЗАПУСКА
# ======================================

# Проверить backend:
curl http://localhost:4000/health

# Проверить API:
curl http://localhost:4000/api/v2/auth/register

# Открыть frontend:
open http://localhost:3000  # macOS
start http://localhost:3000 # Windows
xdg-open http://localhost:3000 # Linux
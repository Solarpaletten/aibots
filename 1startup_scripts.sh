#!/bin/bash

# 🚀 SOLAR v2.0 - Скрипты запуска сервера
# Автор: SOLAR Team

echo "🚀 SOLAR v2.0 - Автоматический запуск сервера"
echo "=============================================="

# Проверка Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не установлен. Установите Node.js 18+ и повторите попытку."
    exit 1
fi

echo "✅ Node.js: $(node --version)"

# Функция для проверки порта
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null; then
        echo "⚠️  Порт $port занят. Завершаем процесс..."
        kill -9 $(lsof -Pi :$port -sTCP:LISTEN -t) 2>/dev/null || true
        sleep 2
    fi
}

# Проверяем и освобождаем порты
echo "🔍 Проверка портов..."
check_port 3000
check_port 4000

# 1. СКРИПТ УСТАНОВКИ ЗАВИСИМОСТЕЙ
install_dependencies() {
    echo ""
    echo "📦 Установка зависимостей..."
    echo "=============================="
    
    # Backend
    echo "🔧 Backend зависимости..."
    cd b/ || exit 1
    if [ ! -d "node_modules" ]; then
        npm install
    else
        echo "✅ Backend зависимости уже установлены"
    fi
    
    # Frontend
    echo "🎨 Frontend зависимости..."
    cd ../f/ || exit 1
    if [ ! -d "node_modules" ]; then
        npm install
    else
        echo "✅ Frontend зависимости уже установлены"  
    fi
    
    cd .. || exit 1
    echo "✅ Все зависимости установлены!"
}

# 2. СКРИПТ НАСТРОЙКИ ENVIRONMENT
setup_environment() {
    echo ""
    echo "🔧 Настройка environment файлов..."
    echo "=================================="
    
    # Backend .env
    if [ ! -f "b/.env" ]; then
        echo "📝 Создание backend .env..."
        cp b/.env.example b/.env
        
        # Обновляем настройки
        sed -i 's/PORT=3001/PORT=4000/g' b/.env 2>/dev/null || true
        sed -i 's/NODE_ENV=production/NODE_ENV=development/g' b/.env 2>/dev/null || true
        
        echo "✅ Backend .env создан"
    else
        echo "✅ Backend .env уже существует"
    fi
    
    # Frontend .env
    if [ ! -f "f/.env" ]; then
        echo "📝 Создание frontend .env..."
        cp f/.env.example f/.env
        
        # Обновляем настройки
        cat > f/.env << EOF
# Backend API URL
VITE_API_URL=http://localhost:4000/api/v2

# Socket.IO URL  
VITE_SOCKET_URL=http://localhost:4000

# Environment
VITE_NODE_ENV=development

# App Configuration
VITE_APP_NAME="SOLAR Translator"
VITE_APP_VERSION="2.0.0"
EOF
        
        echo "✅ Frontend .env создан"
    else
        echo "✅ Frontend .env уже существует"
    fi
}

# 3. ФУНКЦИЯ ЗАПУСКА BACKEND
start_backend() {
    echo ""
    echo "🔥 Запуск Backend сервера (порт 4000)..."
    echo "======================================="
    
    cd b/ || exit 1
    
    # Проверяем наличие основных файлов
    if [ ! -f "src/index.js" ]; then
        echo "❌ Файл src/index.js не найден!"
        exit 1
    fi
    
    # Запускаем сервер
    echo "🚀 Запуск: npm run dev"
    npm run dev &
    BACKEND_PID=$!
    
    # Ждем запуска
    echo "⏳ Ожидание запуска backend..."
    sleep 5
    
    # Проверяем запуск
    if curl -s http://localhost:4000/health > /dev/null 2>&1; then
        echo "✅ Backend запущен успешно! (PID: $BACKEND_PID)"
        echo "🌐 Health Check: http://localhost:4000/health"
        echo "📊 API Base: http://localhost:4000/api/v2"
    else
        echo "❌ Backend не отвечает. Проверьте логи."
    fi
    
    cd .. || exit 1
}

# 4. ФУНКЦИЯ ЗАПУСКА FRONTEND
start_frontend() {
    echo ""
    echo "🎨 Запуск Frontend сервера (порт 3000)..."
    echo "========================================"
    
    cd f/ || exit 1
    
    # Проверяем наличие основных файлов
    if [ ! -f "package.json" ]; then
        echo "❌ Файл package.json не найден!"
        exit 1
    fi
    
    # Запускаем сервер
    echo "🚀 Запуск: npm run dev"
    npm run dev &
    FRONTEND_PID=$!
    
    # Ждем запуска
    echo "⏳ Ожидание запуска frontend..."
    sleep 5
    
    # Проверяем запуск
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ Frontend запущен успешно! (PID: $FRONTEND_PID)"
        echo "🌐 Приложение: http://localhost:3000"
    else
        echo "❌ Frontend не отвечает. Проверьте логи."
    fi
    
    cd .. || exit 1
}

# 5. ОСНОВНАЯ ФУНКЦИЯ ЗАПУСКА
main() {
    echo "🎯 Режим: Полный запуск SOLAR v2.0"
    echo ""
    
    # 1. Установка зависимостей
    install_dependencies
    
    # 2. Настройка environment
    setup_environment
    
    # 3. Запуск backend
    start_backend
    
    # 4. Запуск frontend  
    start_frontend
    
    echo ""
    echo "🎉 SOLAR v2.0 запущен успешно!"
    echo "================================"
    echo ""
    echo "📱 URLs:"
    echo "  🌐 Frontend:    http://localhost:3000"
    echo "  🖥️  Backend:     http://localhost:4000"  
    echo "  🔍 Health:      http://localhost:4000/health"
    echo "  📊 API:         http://localhost:4000/api/v2"
    echo ""
    echo "🎮 Команды:"
    echo "  Ctrl+C      - Остановить все сервера"
    echo "  ./restart   - Перезапустить"
    echo "  ./logs      - Показать логи"
    echo ""
    echo "✨ Готово! Откройте http://localhost:3000 в браузере"
    echo ""
    
    # Ожидание завершения
    wait
}

# 6. ДОПОЛНИТЕЛЬНЫЕ СКРИПТЫ

# Скрипт быстрого запуска (только backend)
start_backend_only() {
    echo "🔥 Быстрый запуск: только Backend"
    check_port 4000
    setup_environment
    start_backend
    echo "✅ Backend готов на http://localhost:4000"
    wait
}

# Скрипт быстрого запуска (только frontend)
start_frontend_only() {
    echo "🎨 Быстрый запуск: только Frontend"
    check_port 3000
    setup_environment
    start_frontend
    echo "✅ Frontend готов на http://localhost:3000"
    wait
}

# Определяем режим запуска
case "${1:-full}" in
    "backend"|"b")
        start_backend_only
        ;;
    "frontend"|"f")
        start_frontend_only
        ;;
    "full"|""|*)
        main
        ;;
esac
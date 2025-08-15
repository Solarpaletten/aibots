#!/bin/bash
echo "📱 Настройка SOLAR для IP: 172.20.10.4"

# Обновляем frontend .env
cat > f/.env << EOF
VITE_API_URL=http://172.20.10.4:4000/api/v2
VITE_SOCKET_URL=http://172.20.10.4:4000
VITE_NODE_ENV=development
EOF

echo "✅ Frontend настроен для мобильного"
echo "📱 Откройте на телефоне: http://172.20.10.4:3000"

# Перезапускаем frontend
cd f && npm run dev
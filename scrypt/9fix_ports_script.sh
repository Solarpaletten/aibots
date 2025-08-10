#!/bin/bash

echo "🎯 SOLAR v2.0 - Исправление портов: Backend:4000, Frontend:3000"
echo "================================================================"

# Исправляем Backend .env.example
echo "🖥️ Исправление Backend портов..."
cat > b/.env.example << 'EOF'
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/solar_db"

# API Keys (replace with your actual keys)
OPENAI_API_KEY="your-openai-api-key-here"
TELEGRAM_BOT_TOKEN="your-telegram-bot-token-here"

# Server Configuration
PORT=4000
NODE_ENV=development

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-here"

# CORS Origin
CORS_ORIGIN="http://localhost:3000"
EOF

echo "✅ Backend .env.example обновлен (PORT=4000)"

# Исправляем Frontend .env.example
echo "🌐 Исправление Frontend портов..."
cat > f/.env.example << 'EOF'
# Backend API URL
VITE_API_URL="http://localhost:4000/api/v2"

# Environment
VITE_NODE_ENV=development

# App Configuration
VITE_APP_NAME="SOLAR Translator"
VITE_APP_VERSION="2.0.0"

# Socket.IO URL
VITE_SOCKET_URL="http://localhost:4000"
EOF

echo "✅ Frontend .env.example обновлен (API -> localhost:4000)"

# Исправляем Backend package.json для правильного порта
echo "📦 Обновление Backend package.json..."
cd b/
if [ -f "package.json" ]; then
    # Обновляем dev script чтобы использовать правильный порт
    cat > package.json << 'EOF'
{
  "name": "solar-translator-api",
  "version": "2.0.0",
  "description": "SOLAR Voice Translator - Backend API",
  "main": "src/index.js",
  "scripts": {
    "dev": "PORT=4000 nodemon src/index.js",
    "start": "PORT=4000 node src/index.js",
    "test": "jest",
    "lint": "eslint src/**/*.js",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:studio": "prisma studio"
  },
  "keywords": ["translator", "voice", "ai", "realtime"],
  "author": "SOLAR Team",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.7.5",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.1",
    "express-rate-limit": "^7.1.5",
    "compression": "^1.7.4",
    "morgan": "^1.10.0",
    "dotenv": "^16.3.1",
    "openai": "^4.24.1",
    "prisma": "^5.7.1",
    "@prisma/client": "^5.7.1",
    "redis": "^4.6.12",
    "bull": "^4.12.2",
    "axios": "^1.6.2",
    "form-data": "^4.0.0",
    "uuid": "^9.0.1",
    "joi": "^17.11.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "eslint": "^8.56.0",
    "jest": "^29.7.0",
    "@jest/globals": "^29.7.0"
  }
}
EOF
    echo "✅ Backend package.json обновлен с PORT=4000"
fi

cd ..

# Исправляем Frontend vite.config.ts для правильного порта
echo "⚡ Обновление Frontend Vite конфигурации..."
cd f/
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        ws: true,
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
EOF

echo "✅ Frontend vite.config.ts обновлен (port: 3000, proxy -> 4000)"

cd ..

# Обновляем константы в Frontend
echo "🔧 Обновление Frontend констант..."
cat > f/src/utils/constants.ts << 'EOF'
import { LanguageOption } from '@/types/translation'

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'EN', name: 'English', flag: '🇺🇸' },
  { code: 'RU', name: 'Русский', flag: '🇷🇺' },
  { code: 'DE', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ES', name: 'Español', flag: '🇪🇸' },
  { code: 'CS', name: 'Čeština', flag: '🇨🇿' },
  { code: 'PL', name: 'Polski', flag: '🇵🇱' },
  { code: 'LT', name: 'Lietuvių', flag: '🇱🇹' },
  { code: 'LV', name: 'Latviešu', flag: '🇱🇻' },
  { code: 'NO', name: 'Norsk', flag: '🇳🇴' },
]

export const SUBSCRIPTION_LIMITS = {
  FREE: {
    voiceMinutesPerMonth: 50,
    apiCallsPerMonth: 1000,
    concurrentCalls: 1,
  },
  PREMIUM: {
    voiceMinutesPerMonth: 1000,
    apiCallsPerMonth: 10000,
    concurrentCalls: 5,
  },
  BUSINESS: {
    voiceMinutesPerMonth: 10000,
    apiCallsPerMonth: 100000,
    concurrentCalls: 20,
  },
}

export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || 'SOLAR Voice Translator',
  version: import.meta.env.VITE_APP_VERSION || '2.0.0',
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v2',
  socketUrl: import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000',
}
EOF

echo "✅ Frontend константы обновлены с правильными портами"

# Обновляем Backend index.js для правильного порта и CORS
echo "🔄 Обновление Backend главного файла..."
cat > b/src/index.js << 'EOF'
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { createServer } = require('http');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Routes
const authRoutes = require('./routes/auth');
const translateRoutes = require('./routes/translate');
const userRoutes = require('./routes/user');
const callRoutes = require('./routes/call');

// Middleware
const { errorHandler } = require('./middleware/errorHandler');
const { authMiddleware } = require('./middleware/auth');

// Services
const { RealtimeTranslationService } = require('./services/realtimeTranslation');
const { VoiceProcessingService } = require('./services/voiceProcessing');

// Utils
const { logger } = require('./utils/logger');
const { connectDatabase } = require('./utils/database');
const { connectRedis } = require('./utils/redis');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 4000;

// Initialize services
const realtimeService = new RealtimeTranslationService(io);
const voiceService = new VoiceProcessingService();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "https:", "http://localhost:3000"],
    },
  },
}));

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(compression());
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting to API routes
app.use('/api', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  });
});

// API Routes
app.use('/api/v2/auth', authRoutes);
app.use('/api/v2/translate', translateRoutes);
app.use('/api/v2/user', userRoutes);
app.use('/api/v2/call', callRoutes);

// Socket.IO namespace
io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);
});

// Error handling middleware
app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();
    
    // Connect to Redis (optional)
    await connectRedis();
    
    // Start server
    server.listen(PORT, () => {
      logger.info(`🚀 SOLAR v2.0 API Server running on port ${PORT}`);
      logger.info(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🌐 Health check: http://localhost:${PORT}/health`);
      logger.info(`📞 Frontend URL: http://localhost:3000`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});
EOF

echo "✅ Backend index.js обновлен с правильными портами"

# Обновляем README с правильными портами
echo "📝 Обновление README..."
cat > README.md << 'EOF'
# 🚀 SOLAR Voice Translator v2.0

> **Real-time AI-powered voice translation that breaks language barriers**

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/Solarpaletten/aibots)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-18.2.0-blue.svg)](https://reactjs.org/)

## 🌟 Features

- 🎤 **Voice-to-Voice Translation** - Real-time voice translation with natural AI voices
- 📞 **Live Call Translation** - Translate phone calls in real-time
- 🌍 **10+ Languages** - Support for English, Russian, German, Spanish, and more
- ⚡ **Instant Processing** - Lightning-fast translations powered by OpenAI GPT-4
- 🔒 **Privacy First** - End-to-end encryption for all conversations
- 💼 **Business Ready** - Enterprise features for teams and organizations

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- OpenAI API key

### Backend Setup (Port 4000)

```bash
# 1. Navigate to backend
cd b/

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env with your configuration

# 4. Start development server
npm run dev
```

**Backend будет доступен на: http://localhost:4000**

### Frontend Setup (Port 3000)

```bash
# 1. Navigate to frontend
cd f/

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env

# 4. Start development server
npm run dev
```

**Frontend будет доступен на: http://localhost:3000**

## 🎯 URLs

- 🌐 **Frontend**: http://localhost:3000
- 🖥️ **Backend API**: http://localhost:4000
- 🔍 **Health Check**: http://localhost:4000/health
- 📊 **API Base**: http://localhost:4000/api/v2

## 📱 Supported Languages

🇺🇸 English • 🇷🇺 Russian • 🇩🇪 German • 🇪🇸 Spanish • 🇨🇿 Czech • 🇵🇱 Polish • 🇱🇹 Lithuanian • 🇱🇻 Latvian • 🇳🇴 Norwegian

## 💰 Pricing Tiers

| Plan | Price | Voice Minutes | Features |
|------|-------|---------------|----------|
| **Free** | $0/month | 50/month | Basic translation, 10 languages |
| **Premium** | $9.99/month | 1,000/month | HD voice, real-time calls, priority |
| **Business** | $49.99/month | 10,000/month | Team management, API access, analytics |

## 🚀 Ready to Launch!

1. Start Backend: `cd b && npm run dev` (Port 4000)
2. Start Frontend: `cd f && npm run dev` (Port 3000)
3. Open browser: http://localhost:3000
4. Start translating! 🎤

---

**Made with ❤️ by SOLAR Team** | **GitHub**: https://github.com/Solarpaletten/aibots
EOF

echo ""
echo "🎉 ГОТОВО! Порты исправлены!"
echo "=========================="
echo ""
echo "🎯 НОВАЯ КОНФИГУРАЦИЯ:"
echo "🖥️ Backend:  http://localhost:4000"
echo "🌐 Frontend: http://localhost:3000"
echo ""
echo "🚀 КОМАНДЫ ДЛЯ ЗАПУСКА:"
echo ""
echo "1️⃣ Backend (терминал 1):"
echo "   cd b/"
echo "   npm install"
echo "   npm run dev"
echo ""
echo "2️⃣ Frontend (терминал 2):"
echo "   cd f/"
echo "   npm install"
echo "   npm run dev"
echo ""
echo "✅ Все файлы обновлены с правильными портами!"
echo "🔥 КОСМИЧЕСКИЙ КОРАБЛЬ ГОТОВ К ПОЛЁТУ!"

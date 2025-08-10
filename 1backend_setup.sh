#!/bin/bash

# 🚀 BACKEND FILES SETUP

echo "🚀 SOLAR v2.0 - Backend API Setup"
echo "=================================="
mkdir -p b
echo "📂 Переход в директорию проекта..."
cd b/ 

# Создаем структуру папок
echo "📁 Создание структуры проекта..."
mkdir -p {src/{controllers,middleware,routes,services,types,utils},tests,uploads,logs}

echo "📦 Инициализация Node.js проекта..."
cat > package.json << 'EOF'
{
  "name": "solar-translator-api",
  "version": "2.0.0",
  "description": "SOLAR Voice Translator - Backend API",
  "main": "dist/index.js",
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js",
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

echo "🔧 Создание ESLint конфигурации для JavaScript..."
cat > .eslintrc.js << 'EOF'
module.exports = {
  env: {
    node: true,
    es2022: true,
  },
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
  },
};
EOF

echo "🛠️ Создание Prisma схемы..."
mkdir -p prisma
cat > prisma/schema.prisma << 'EOF'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                String   @id @default(uuid())
  email             String   @unique
  password          String
  name              String?
  subscriptionTier  SubscriptionTier @default(FREE)
  voiceMinutesUsed  Int      @default(0)
  apiKeysUsed       Int      @default(0)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  sessions          TranslationSession[]
  callParticipants  CallParticipant[]
  
  @@map("users")
}

model TranslationSession {
  id              String   @id @default(uuid())
  userId          String
  fromLanguage    Language
  toLanguage      Language
  type            TranslationType
  duration        Int?     // seconds
  charactersCount Int      @default(0)
  voiceMinutes    Float    @default(0)
  createdAt       DateTime @default(now())
  
  user            User     @relation(fields: [userId], references: [id])
  voices          VoiceTranslation[]
  
  @@map("translation_sessions")
}

model VoiceTranslation {
  id                String   @id @default(uuid())
  sessionId         String
  originalText      String
  translatedText    String
  originalAudioUrl  String?
  translatedAudioUrl String?
  processingTime    Int      // milliseconds
  createdAt         DateTime @default(now())
  
  session           TranslationSession @relation(fields: [sessionId], references: [id])
  
  @@map("voice_translations")
}

model CallSession {
  id              String   @id @default(uuid())
  status          CallStatus @default(WAITING)
  startedAt       DateTime @default(now())
  endedAt         DateTime?
  duration        Int?     // seconds
  
  participants    CallParticipant[]
  
  @@map("call_sessions")
}

model CallParticipant {
  id          String   @id @default(uuid())
  callId      String
  userId      String
  language    Language
  role        ParticipantRole @default(PARTICIPANT)
  joinedAt    DateTime @default(now())
  leftAt      DateTime?
  
  call        CallSession @relation(fields: [callId], references: [id])
  user        User        @relation(fields: [userId], references: [id])
  
  @@unique([callId, userId])
  @@map("call_participants")
}

enum SubscriptionTier {
  FREE
  PREMIUM
  BUSINESS
}

enum Language {
  EN  // English
  RU  // Russian
  DE  // German
  ES  // Spanish
  CS  // Czech
  PL  // Polish
  LT  // Lithuanian
  LV  // Latvian
  NO  // Norwegian
}

enum TranslationType {
  TEXT
  VOICE
  REALTIME_CALL
}

enum CallStatus {
  WAITING
  ACTIVE
  ENDED
}

enum ParticipantRole {
  HOST
  PARTICIPANT
}
EOF

echo "⚙️ Создание Environment файла..."
cat > .env.example << 'EOF'
# Server Configuration
NODE_ENV=development
PORT=3001
API_VERSION=v2

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/solar_translator"

# Redis Cache
REDIS_URL="redis://localhost:6379"

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="24h"

# OpenAI API
OPENAI_API_KEY="sk-your-openai-api-key"

# ElevenLabs (Text-to-Speech)
ELEVENLABS_API_KEY="your-elevenlabs-api-key"

# AWS S3 (File Storage)
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="solar-translator-files"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN="http://localhost:3000,http://localhost:5173"

# Subscription Limits
FREE_VOICE_MINUTES_PER_MONTH=50
PREMIUM_VOICE_MINUTES_PER_MONTH=1000
BUSINESS_VOICE_MINUTES_PER_MONTH=10000

# Telegram Bot Integration
TELEGRAM_BOT_TOKEN="your-telegram-bot-token"
TELEGRAM_WEBHOOK_URL="https://your-domain.com/api/v2/telegram/webhook"
EOF

echo "📝 Создание основного файла README..."
cat > README.md << 'EOF'
# 🚀 SOLAR v2.0 - Backend API

Real-time voice translation API powered by AI.

## Features

- 🎤 Voice-to-Voice translation (10 languages)
- 📞 Real-time call translation
- 🤖 AI-powered accuracy (OpenAI GPT-4)
- 🔒 JWT Authentication
- 💰 Subscription tiers (Free/Premium/Business)
- ⚡ WebSocket real-time communication
- 📊 Usage analytics

## Quick Start

```bash
# Install dependencies
npm install

# Setup database
npm run db:push

# Start development server
npm run dev
```

## API Endpoints

- `POST /api/v2/auth/register` - User registration
- `POST /api/v2/auth/login` - User login
- `POST /api/v2/translate/text` - Text translation
- `POST /api/v2/translate/voice` - Voice translation
- `WS /api/v2/realtime` - Real-time translation

## Tech Stack

- Node.js + TypeScript
- Express.js + Socket.IO
- PostgreSQL + Prisma
- Redis + Bull Queue
- OpenAI + ElevenLabs

## Architecture

```
src/
├── controllers/     # Route handlers
├── middleware/      # Auth, validation, etc.
├── routes/         # API routes
├── services/       # Business logic
├── types/          # TypeScript types
└── utils/          # Helper functions
```
EOF

echo "✅ Backend структура создана!"
echo ""
echo "🚀 Следующие шаги:"
echo "1. cd b/"
echo "2. npm install"
echo "3. cp .env.example .env"
echo "4. npm run dev"
echo ""
echo "📝 Не забудьте настроить:"
echo "- DATABASE_URL в .env"
echo "- OPENAI_API_KEY в .env"
echo "- Остальные API ключи"
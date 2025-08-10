#!/bin/bash

echo "🚀 SOLAR v2.0 - Deploy to GitHub"
echo "================================="

# Проверяем, что мы в корректной директории
if [ ! -d "b" ] || [ ! -d "f" ]; then
    echo "❌ Ошибка: Запустите скрипт из корневой директории проекта (где есть папки b/ и f/)"
    exit 1
fi

# Создаем основные файлы проекта
echo "📝 Создание основных файлов проекта..."

# .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
*/node_modules/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build outputs
dist/
build/
*/dist/
*/build/

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*
logs/
*.log.*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next

# Nuxt.js build / generate output
.nuxt

# Gatsby files
.cache/
public

# Storybook build outputs
.out
.storybook-out

# Temporary folders
tmp/
temp/

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Database
*.db
*.sqlite

# Uploads
uploads/*
!uploads/.gitkeep

# PM2
.pm2/

# Docker
Dockerfile.local
docker-compose.override.yml
EOF

# README.md
cat > README.md << 'EOF'
# 🚀 SOLAR Voice Translator v2.0

> **Real-time AI-powered voice translation that breaks language barriers**

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/solar-team/solar-translator)
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

## 🏗️ Architecture

```
solar-translator/
├── b/                  # 🖥️ Backend (Node.js + JavaScript)
│   ├── src/
│   │   ├── routes/     # API routes
│   │   ├── services/   # Business logic
│   │   ├── middleware/ # Auth & validation
│   │   └── utils/      # Helper functions
│   └── prisma/         # Database schema
│
├── f/                  # 🌐 Frontend (React + TypeScript)
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── pages/      # App pages
│   │   ├── hooks/      # Custom hooks
│   │   └── services/   # API services
│   └── public/
│
└── docs/               # 📚 Documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- OpenAI API key
- Redis (optional, for caching)

### Backend Setup

```bash
# 1. Navigate to backend
cd b/

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env with your configuration

# 4. Setup database
npm run db:push

# 5. Start development server
npm run dev
```

### Frontend Setup

```bash
# 1. Navigate to frontend
cd f/

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env with your configuration

# 4. Start development server
npm run dev
```

## 🔧 Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/solar_translator"

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="24h"

# OpenAI API
OPENAI_API_KEY="sk-your-openai-api-key"

# Server Configuration
PORT=3001
NODE_ENV=development
```

### Frontend (.env)

```env
# API Configuration
VITE_API_URL=http://localhost:3001/api/v2
VITE_SOCKET_URL=http://localhost:3001

# App Configuration
VITE_APP_NAME="SOLAR Voice Translator"
VITE_APP_VERSION=2.0.0
```

## 📱 Supported Languages

- 🇺🇸 English
- 🇷🇺 Russian  
- 🇩🇪 German
- 🇪🇸 Spanish
- 🇨🇿 Czech
- 🇵🇱 Polish
- 🇱🇹 Lithuanian
- 🇱🇻 Latvian
- 🇳🇴 Norwegian

## 💰 Pricing Tiers

| Plan | Price | Voice Minutes | Features |
|------|-------|---------------|----------|
| **Free** | $0/month | 50/month | Basic translation, 10 languages |
| **Premium** | $9.99/month | 1,000/month | HD voice, real-time calls, priority |
| **Business** | $49.99/month | 10,000/month | Team management, API access, analytics |

## 🔌 API Endpoints

### Authentication
- `POST /api/v2/auth/register` - User registration
- `POST /api/v2/auth/login` - User login
- `POST /api/v2/auth/refresh` - Refresh token

### Translation
- `POST /api/v2/translate/text` - Text translation
- `POST /api/v2/translate/voice` - Voice translation
- `GET /api/v2/translate/history` - Translation history

### Real-time
- `WebSocket /socket.io` - Real-time translation events

## 🧪 Testing

```bash
# Backend tests
cd b/ && npm test

# Frontend tests  
cd f/ && npm test

# E2E tests
npm run test:e2e
```

## 🚢 Deployment

### Docker

```bash
# Build and run with Docker Compose
docker-compose up --build
```

### Manual Deployment

```bash
# Backend
cd b/
npm run build
npm start

# Frontend
cd f/
npm run build
# Serve dist/ folder
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 Competitive Advantages

### vs AI Phone Apps:
- ✅ **No Download Required** - Works in Telegram/Web
- ✅ **10+ Languages** vs их 2-3
- ✅ **Free Tier** + Premium options
- ✅ **Group Translations** (conference calls)
- ✅ **Open Source Core** + Paid features

### vs Built-in Solutions:
- ✅ **Cross-platform** (iOS, Android, Web)
- ✅ **Better AI models** (GPT-4, Claude)
- ✅ **Custom vocabulary** learning
- ✅ **Business integrations**

## 📞 Support

- 📧 Email: support@solar-translator.com
- 💬 Discord: [Join our community](https://discord.gg/solar)
- 📖 Documentation: [docs.solar-translator.com](https://docs.solar-translator.com)

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=solar-team/solar-translator&type=Date)](https://star-history.com/#solar-team/solar-translator&Date)

---

**Made with ❤️ by the SOLAR Team**

*Breaking language barriers, one conversation at a time.* 🌍✨
EOF

# package.json для корневого проекта
cat > package.json << 'EOF'
{
  "name": "solar-translator",
  "version": "2.0.0",
  "description": "SOLAR Voice Translator - Real-time AI-powered translation",
  "private": true,
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "cd b && npm run dev",
    "dev:frontend": "cd f && npm run dev",
    "build": "npm run build:backend && npm run build:frontend",
    "build:backend": "cd b && npm run build",
    "build:frontend": "cd f && npm run build",
    "install:all": "npm install && cd b && npm install && cd ../f && npm install",
    "test": "npm run test:backend && npm run test:frontend",
    "test:backend": "cd b && npm test",
    "test:frontend": "cd f && npm test",
    "lint": "npm run lint:backend && npm run lint:frontend",
    "lint:backend": "cd b && npm run lint",
    "lint:frontend": "cd f && npm run lint"
  },
  "keywords": [
    "translation",
    "voice",
    "ai",
    "realtime",
    "openai",
    "react",
    "nodejs"
  ],
  "author": "SOLAR Team",
  "license": "MIT",
  "devDependencies": {
    "concurrently": "^8.2.2"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF

# Инициализируем git репозиторий
echo "🔧 Инициализация Git репозитория..."

# Проверяем, есть ли уже git репозиторий
if [ ! -d ".git" ]; then
    git init
    echo "✅ Git репозиторий инициализирован"
else
    echo "✅ Git репозиторий уже существует"
fi

# Добавляем все файлы
echo "📁 Добавление файлов в Git..."
git add .

# Проверяем статус
echo "📊 Git статус:"
git status --short

# Создаем первый коммит
echo "💾 Создание коммита..."
git commit -m "🚀 Initial commit: SOLAR v2.0 - Full-stack voice translator

Features:
- ✅ Backend API (Node.js + Express + Prisma)
- ✅ Frontend App (React + TypeScript + Tailwind)
- ✅ Authentication system
- ✅ Voice translation pipeline
- ✅ Real-time Socket.IO
- ✅ 10+ language support
- ✅ Subscription tiers
- ✅ Professional architecture

Ready for production deployment! 🌟"

echo ""
echo "🎉 ГОТОВО! Проект готов к деплою на GitHub!"
echo ""
echo "🔗 Следующие шаги для GitHub:"
echo "1. Создайте новый репозиторий на GitHub:"
echo "   https://github.com/new"
echo ""
echo "2. Добавьте remote origin:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/solar-translator.git"
echo ""
echo "3. Пушьте код на GitHub:"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "🚀 Альтернатива - быстрый деплой:"
echo "   gh repo create solar-translator --public --push"
echo ""
echo "✨ Что создано:"
echo "   - 📋 README.md с полной документацией"
echo "   - 🔧 package.json для корневого проекта" 
echo "   - 🚫 .gitignore для всех нужных файлов"
echo "   - 💾 Первый коммит с полным кодом"
echo ""
echo "🌟 SOLAR v2.0 готов покорять мир! 🌍"
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

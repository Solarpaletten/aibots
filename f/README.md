# 🌐 SOLAR v2.0 - Frontend
AI IT BOTS SOLAR


React + TypeScript + Tailwind CSS приложение для голосового перевода.

## Features

- 🎤 Real-time voice translation
- 📞 Call translation interface  
- 🌍 10+ language support
- 📱 Progressive Web App (PWA)
- 🎨 Modern UI with Tailwind CSS
- ⚡ Fast with Vite
- 🔐 JWT Authentication
- 📊 Real-time updates with Socket.IO

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **Socket.IO** - Real-time communication
- **React Query** - Data fetching
- **Zustand** - State management
- **Framer Motion** - Animations

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code
- `npm run type-check` - Check TypeScript

## Project Structure

```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   ├── layout/       # Layout components
│   └── features/     # Feature-specific components
├── pages/            # App pages
├── hooks/            # Custom React hooks
├── services/         # API services
├── types/            # TypeScript types
├── utils/            # Helper functions
└── assets/           # Static assets
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

- `VITE_API_URL` - Backend API URL
- `VITE_SOCKET_URL` - Socket.IO server URL
- Feature flags and other settings

## PWA Support

App includes PWA capabilities:
- Offline functionality
- Install on mobile/desktop
- Push notifications (future)
- Background sync (future)

## Development

The app connects to backend API running on `localhost:3001`.
Make sure backend server is running before starting frontend.

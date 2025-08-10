#!/bin/bash

echo "🚀 SOLAR v2.0 - Frontend Setup (React + TypeScript + Tailwind)"
echo "=============================================================="
mkdir -p f
echo "📂 Переход в директорию проекта..."
cd f
# Создаем структуру папок
echo "📁 Создание структуры React проекта..."
mkdir -p {src/{components/{ui,layout,features},pages,hooks,services,types,utils,assets},public}

echo "📦 Инициализация React + TypeScript проекта..."
cat > package.json << 'EOF'
{
  "name": "solar-translator-frontend",
  "version": "2.0.0",
  "description": "SOLAR Voice Translator - Frontend React App",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.1",
    "@tanstack/react-query": "^5.8.4",
    "zustand": "^4.4.7",
    "socket.io-client": "^4.7.4",
    "axios": "^1.6.2",
    "framer-motion": "^10.16.16",
    "lucide-react": "^0.294.0",
    "@headlessui/react": "^1.7.17",
    "react-hot-toast": "^2.4.1",
    "react-hook-form": "^7.48.2",
    "@hookform/resolvers": "^3.3.2",
    "zod": "^3.22.4",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "@typescript-eslint/eslint-plugin": "^6.10.0",
    "@typescript-eslint/parser": "^6.10.0",
    "@vitejs/plugin-react": "^4.1.1",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.53.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.4",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.3.5",
    "typescript": "^5.2.2",
    "vite": "^5.0.0",
    "vite-plugin-pwa": "^0.17.4"
  }
}
EOF

echo "🔧 Создание Vite конфигурации..."
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'SOLAR Voice Translator',
        short_name: 'SOLAR',
        description: 'Real-time voice translation powered by AI',
        theme_color: '#3B82F6',
        background_color: '#1F2937',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/socket.io': {
        target: 'http://localhost:3001',
        ws: true
      }
    }
  }
})
EOF

echo "🎨 Создание Tailwind CSS конфигурации..."
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        solar: {
          50: '#fef7ee',
          100: '#fdedd3',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          900: '#9a3412',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
EOF

echo "📝 Создание TypeScript конфигурации..."
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOF

cat > tsconfig.node.json << 'EOF'
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
EOF

echo "🎨 Создание CSS файлов..."
cat > src/index.css << 'EOF'
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

@layer base {
  html {
    font-family: 'Inter', system-ui, sans-serif;
  }
  
  body {
    @apply bg-gray-50 text-gray-900 antialiased;
  }
}

@layer components {
  .btn-primary {
    @apply bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200;
  }
  
  .btn-secondary {
    @apply bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-2 px-4 rounded-lg transition-colors duration-200;
  }
  
  .card {
    @apply bg-white rounded-xl shadow-sm border border-gray-200 p-6;
  }
  
  .input-field {
    @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent;
  }
}

@layer utilities {
  .gradient-bg {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
  
  .solar-gradient {
    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  }
}
EOF

cat > postcss.config.js << 'EOF'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

echo "🏗️ Создание index.html..."
cat > index.html << 'EOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="SOLAR Voice Translator - Real-time AI-powered translation" />
    <meta name="theme-color" content="#3B82F6" />
    <title>SOLAR Voice Translator</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF

echo "⚙️ Создание Environment файла..."
cat > .env.example << 'EOF'
# API Configuration
VITE_API_URL=http://localhost:3001/api/v2
VITE_SOCKET_URL=http://localhost:3001

# App Configuration
VITE_APP_NAME="SOLAR Voice Translator"
VITE_APP_VERSION=2.0.0

# Feature Flags
VITE_ENABLE_VOICE_TRANSLATION=true
VITE_ENABLE_CALL_TRANSLATION=true
VITE_ENABLE_PWA=true

# Analytics (optional)
VITE_GOOGLE_ANALYTICS_ID=
VITE_SENTRY_DSN=

# Development
VITE_DEBUG_MODE=true
EOF

echo "🔧 Создание ESLint конфигурации..."
cat > .eslintrc.cjs << 'EOF'
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'react-hooks/exhaustive-deps': 'warn',
  },
}
EOF

echo "📝 Создание README для фронтенда..."
cat > README.md << 'EOF'
# 🌐 SOLAR v2.0 - Frontend

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
EOF

echo "✅ Frontend структура создана!"
echo ""
echo "🚀 Следующие шаги:"
echo "1. cd f/"
echo "2. npm install"
echo "3. cp .env.example .env"
echo "4. npm run dev"
echo ""
echo "🌟 Frontend будет доступен на:"
echo "   http://localhost:3000"
echo ""
echo "💡 Не забудьте:"
echo "- Запустить backend на localhost:3001"
echo "- Настроить VITE_API_URL в .env"
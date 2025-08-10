#!/bin/bash

echo "🔧 SOLAR v2.0 - Быстрое исправление Backend"
echo "=========================================="

cd b/src/

# Создаем недостающий middleware/errorHandler.js
echo "🛡️ Создание errorHandler middleware..."
cat > middleware/errorHandler.js << 'EOF'
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error response
  let error = {
    message: err.message || 'Internal Server Error',
    status: err.status || 500
  };

  // Prisma errors
  if (err.code === 'P2002') {
    error = {
      message: 'Duplicate entry',
      status: 409
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      message: 'Invalid token',
      status: 401
    };
  }

  res.status(error.status).json({
    success: false,
    error: error.message,
    timestamp: new Date().toISOString()
  });
};

module.exports = { errorHandler };
EOF

# Создаем middleware/auth.js
echo "🔐 Создание auth middleware..."
cat > middleware/auth.js << 'EOF'
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid token.'
    });
  }
};

module.exports = { authMiddleware };
EOF

# Создаем services/realtimeTranslation.js
echo "⚡ Создание realtime translation service..."
cat > services/realtimeTranslation.js << 'EOF'
class RealtimeTranslationService {
  constructor(io) {
    this.io = io;
    this.activeRooms = new Map();
    this.init();
  }

  init() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('join-translation-room', (data) => {
        this.handleJoinRoom(socket, data);
      });

      socket.on('voice-chunk', (data) => {
        this.handleVoiceChunk(socket, data);
      });

      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });
    });
  }

  handleJoinRoom(socket, { roomId, language, userId }) {
    socket.join(roomId);
    socket.userId = userId;
    socket.language = language;
    socket.roomId = roomId;

    if (!this.activeRooms.has(roomId)) {
      this.activeRooms.set(roomId, new Set());
    }
    this.activeRooms.get(roomId).add(socket.id);

    socket.emit('joined-room', { 
      roomId, 
      participants: this.activeRooms.get(roomId).size 
    });
  }

  handleVoiceChunk(socket, { audioData, fromLanguage, toLanguage }) {
    // Заглушка для обработки голосового chunk'а
    socket.to(socket.roomId).emit('translated-chunk', {
      translatedAudio: audioData,
      originalText: 'Sample text',
      translatedText: 'Пример текста',
      fromLanguage,
      toLanguage
    });
  }

  handleDisconnect(socket) {
    if (socket.roomId && this.activeRooms.has(socket.roomId)) {
      this.activeRooms.get(socket.roomId).delete(socket.id);
      if (this.activeRooms.get(socket.roomId).size === 0) {
        this.activeRooms.delete(socket.roomId);
      }
    }
  }
}

module.exports = { RealtimeTranslationService };
EOF

# Создаем services/voiceProcessing.js
echo "🎤 Создание voice processing service..."
cat > services/voiceProcessing.js << 'EOF'
class VoiceProcessingService {
  constructor() {
    this.processingQueue = [];
  }

  async processVoiceFile(filePath, fromLanguage, toLanguage) {
    try {
      // Заглушка для обработки голоса
      return {
        originalText: 'Sample voice recognition',
        translatedText: 'Пример распознавания голоса',
        translatedAudioPath: null,
        processingTime: 1500,
        confidence: 0.95
      };
    } catch (error) {
      console.error('Voice processing error:', error);
      throw error;
    }
  }

  async generateSpeech(text, language) {
    // Заглушка для генерации речи
    return {
      audioPath: null,
      duration: text.length * 0.1,
      language
    };
  }
}

module.exports = { VoiceProcessingService };
EOF

# Создаем utils/logger.js
echo "📝 Создание logger utility..."
cat > utils/logger.js << 'EOF'
const logger = {
  info: (message) => console.log(`[INFO] ${new Date().toISOString()}: ${message}`),
  error: (message) => console.error(`[ERROR] ${new Date().toISOString()}: ${message}`),
  warn: (message) => console.warn(`[WARN] ${new Date().toISOString()}: ${message}`),
  debug: (message) => console.debug(`[DEBUG] ${new Date().toISOString()}: ${message}`)
};

module.exports = { logger };
EOF

# Создаем utils/database.js
echo "🗄️ Создание database utility..."
cat > utils/database.js << 'EOF'
// Заглушка для подключения к базе данных
const connectDatabase = async () => {
  try {
    // В реальном проекте здесь будет Prisma
    console.log('✅ Database connected successfully (mock)');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};

module.exports = { connectDatabase };
EOF

# Создаем utils/redis.js
echo "🔄 Создание redis utility..."
cat > utils/redis.js << 'EOF'
const connectRedis = async () => {
  try {
    // Заглушка для Redis подключения
    console.log('✅ Redis connection ready (mock)');
    return {
      get: async (key) => null,
      set: async (key, value) => true,
      del: async (key) => true
    };
  } catch (error) {
    console.warn('⚠️ Redis not available, using memory cache');
    return null;
  }
};

module.exports = { connectRedis };
EOF

# Обновляем routes для работы
echo "🛣️ Обновление routes..."

# routes/auth.js
cat > routes/auth.js << 'EOF'
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Mock user for demo
const mockUser = {
  id: '1',
  email: 'demo@solar.ai',
  password: '$2a$10$CwTycUXWue0Thq9StjOtBuHAgPAb8gRNpBG1vXZGq.XfYKzgkgsKa', // password: demo123
  name: 'Demo User',
  subscriptionTier: 'FREE'
};

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate token
    const token = jwt.sign(
      { id: '1', email, subscriptionTier: 'FREE' },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: '1',
          email,
          name,
          subscriptionTier: 'FREE',
          voiceMinutesUsed: 0
        },
        token,
        expiresIn: '24h'
      },
      message: 'User registered successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Registration failed'
    });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists (demo)
    if (email !== mockUser.email) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, mockUser.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: mockUser.id, email: mockUser.email, subscriptionTier: mockUser.subscriptionTier },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      data: {
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          subscriptionTier: mockUser.subscriptionTier,
          voiceMinutesUsed: 0
        },
        token,
        expiresIn: '24h'
      },
      message: 'Login successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

module.exports = router;
EOF

# routes/translate.js
cat > routes/translate.js << 'EOF'
const express = require('express');
const router = express.Router();

// Text translation endpoint
router.post('/text', (req, res) => {
  try {
    const { text, fromLanguage, toLanguage } = req.body;
    
    // Mock translation
    const translations = {
      'EN': {
        'RU': 'Привет мир',
        'DE': 'Hallo Welt',
        'ES': 'Hola mundo'
      },
      'RU': {
        'EN': 'Hello world',
        'DE': 'Hallo Welt'
      }
    };

    const translatedText = translations[fromLanguage]?.[toLanguage] || `Translated: ${text}`;

    res.json({
      success: true,
      data: {
        originalText: text,
        translatedText,
        fromLanguage,
        toLanguage,
        processingTime: 150,
        confidence: 0.95,
        sessionId: 'demo-session'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Translation failed'
    });
  }
});

// Voice translation endpoint
router.post('/voice', (req, res) => {
  try {
    const { audioData, fromLanguage, toLanguage } = req.body;
    
    res.json({
      success: true,
      data: {
        originalText: 'Hello, this is a voice message',
        translatedText: 'Привет, это голосовое сообщение',
        translatedAudio: null,
        fromLanguage,
        toLanguage,
        processingTime: 2500,
        confidence: 0.92,
        sessionId: 'demo-voice-session'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Voice translation failed'
    });
  }
});

module.exports = router;
EOF

# routes/user.js
cat > routes/user.js << 'EOF'
const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// Get user profile
router.get('/profile', authMiddleware, (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: req.user.id,
        email: req.user.email,
        name: 'Demo User',
        subscriptionTier: req.user.subscriptionTier,
        voiceMinutesUsed: 15,
        apiKeysUsed: 150,
        createdAt: '2024-01-01T00:00:00Z'
      }
    }
  });
});

module.exports = router;
EOF

# routes/call.js
cat > routes/call.js << 'EOF'
const express = require('express');
const router = express.Router();

// Create call session
router.post('/create', (req, res) => {
  try {
    const { participants, languages } = req.body;
    
    res.json({
      success: true,
      data: {
        callId: 'demo-call-123',
        status: 'WAITING',
        participants: participants || [],
        createdAt: new Date().toISOString()
      },
      message: 'Call session created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create call session'
    });
  }
});

module.exports = router;
EOF

echo ""
echo "✅ ГОТОВО! Все недостающие файлы созданы!"
echo ""
echo "🚀 Теперь пробуйте запустить Backend:"
echo "npm run dev"
echo ""
echo "🎯 Что создано:"
echo "- ✅ middleware/errorHandler.js"
echo "- ✅ middleware/auth.js"  
echo "- ✅ services/realtimeTranslation.js"
echo "- ✅ services/voiceProcessing.js"
echo "- ✅ utils/logger.js"
echo "- ✅ utils/database.js"
echo "- ✅ utils/redis.js"
echo "- ✅ Обновленные routes с демо-данными"
echo ""
echo "🔥 BACKEND ГОТОВ К ПОЛЁТУ НА ПОРТ 4000! 🚀"

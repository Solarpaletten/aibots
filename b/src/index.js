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
    origin: process.env.CORS_ORIGIN?.split(',') || ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 3001;

// Initialize services
const realtimeService = new RealtimeTranslationService(io);
const voiceService = new VoiceProcessingService();

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
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
      connectSrc: ["'self'", "wss:", "https:"],
    },
  },
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ["http://localhost:3000"],
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
    environment: process.env.NODE_ENV 
  });
});

// API Routes
app.use('/api/v2/auth', authRoutes);
app.use('/api/v2/translate', authMiddleware, translateRoutes);
app.use('/api/v2/user', authMiddleware, userRoutes);
app.use('/api/v2/call', authMiddleware, callRoutes);

// Socket.IO connection handling
io.use((socket, next) => {
  // Socket authentication middleware
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  
  try {
    // Verify JWT token here
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // socket.userId = decoded.userId;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.id}`);
  
  // Join translation room
  socket.on('join-translation', async (data) => {
    const { roomId, language } = data;
    socket.join(roomId);
    socket.language = language;
    
    logger.info(`User ${socket.id} joined room ${roomId} with language ${language}`);
    
    // Notify room participants
    socket.to(roomId).emit('user-joined', {
      userId: socket.id,
      language: language
    });
  });
  
  // Handle real-time voice translation
  socket.on('voice-chunk', async (data) => {
    try {
      const { audioChunk, roomId, targetLanguage } = data;
      
      // Process voice chunk
      const result = await realtimeService.processVoiceChunk(
        audioChunk,
        socket.language,
        targetLanguage
      );
      
      // Send translated audio to room
      socket.to(roomId).emit('translated-voice', {
        translatedAudio: result.translatedAudio,
        translatedText: result.translatedText,
        fromUser: socket.id
      });
      
    } catch (error) {
      logger.error('Voice translation error:', error);
      socket.emit('translation-error', { message: 'Translation failed' });
    }
  });
  
  // Handle text translation
  socket.on('translate-text', async (data) => {
    try {
      const { text, fromLang, toLang, roomId } = data;
      
      const result = await realtimeService.translateText(text, fromLang, toLang);
      
      // Send to specific room or back to sender
      const target = roomId ? socket.to(roomId) : socket;
      target.emit('text-translated', {
        originalText: text,
        translatedText: result.translatedText,
        fromUser: socket.id
      });
      
    } catch (error) {
      logger.error('Text translation error:', error);
      socket.emit('translation-error', { message: 'Translation failed' });
    }
  });
  
  // Handle call translation
  socket.on('start-call-translation', async (data) => {
    const { callId, participants } = data;
    socket.join(`call-${callId}`);
    
    // Initialize call translation session
    await realtimeService.startCallSession(callId, participants);
    
    logger.info(`Call translation started: ${callId}`);
  });
  
  socket.on('call-audio', async (data) => {
    try {
      const { callId, audioChunk } = data;
      
      // Process and translate call audio
      const translations = await realtimeService.processCallAudio(
        audioChunk,
        socket.language,
        callId
      );
      
      // Send translations to all call participants
      translations.forEach(({ targetLanguage, translatedAudio, translatedText }) => {
        socket.to(`call-${callId}`).emit('call-translation', {
          targetLanguage,
          translatedAudio,
          translatedText,
          fromUser: socket.id
        });
      });
      
    } catch (error) {
      logger.error('Call translation error:', error);
      socket.emit('translation-error', { message: 'Call translation failed' });
    }
  });
  
  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.id}`);
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `${req.method} ${req.originalUrl} is not a valid endpoint`
  });
});

async function startServer() {
  try {
    // Connect to database
    await connectDatabase();
    logger.info('✅ Database connected');
    
    // Connect to Redis
    await connectRedis();
    logger.info('✅ Redis connected');
    
    // Start server
    server.listen(PORT, () => {
      logger.info(`🚀 SOLAR v2.0 API Server running on port ${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
      logger.info(`🌐 CORS enabled for: ${process.env.CORS_ORIGIN}`);
      logger.info(`🔊 Socket.IO server ready for real-time translations`);
    });
    
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

startServer();
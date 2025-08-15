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

// Utils
const { logger } = require('./utils/logger');
const { connectDatabase } = require('./utils/database');
const { connectRedis } = require('./utils/redis');

const app = express();
const server = createServer(app);

// 🚀 DUAL PORT SOLUTION: 4000 локально, 10000 для Render
const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => {
//   console.log(`✅ Server is running on port ${PORT}`);
// });

console.log(`🎯 Starting server on PORT: ${PORT}`);
console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);

// CORS - поддержка и локалки и Render
const corsOrigins = [
  'http://localhost:3000',           // Frontend локально
  'https://localhost:3000',          
  'http://172.20.10.4:3000',         // Мобильный frontend
  'http://172.20.10.4:4000',         // Мобильный backend
  ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : []),
  process.env.FRONTEND_URL,          // Из .env
  /\.vercel\.app$/,                  // Все Vercel домены
  /\.onrender\.com$/                 // Все Render домены
].filter(Boolean);

console.log('🌐 CORS Origins:', corsOrigins); // Добавьте для отладки

const io = new Server(server, {
  cors: {
    origin: corsOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests' }
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "wss:", "https:", "*"],
    },
  },
}));

app.use(cors({
  origin: corsOrigins,
  credentials: true
}));

app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api', limiter);

// 🩺 Health check - показывает на каком порту работаем
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    message: PORT === '10000' ? 'Running on Render' : 'Running locally'
  });
});

// API Routes
app.use('/api/v2/auth', authRoutes);
app.use('/api/v2/translate', translateRoutes);
app.use('/api/v2/user', userRoutes);
app.use('/api/v2/call', callRoutes);

// Socket.IO
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
});

// Error handling
app.use(errorHandler);

// 🚀 ЕДИНСТВЕННЫЙ server.listen - автоматически на правильном порту
const startServer = async () => {
  try {
    // Database connections (опционально)
    try {
      await connectDatabase();
      console.log('✅ Database connected');
    } catch (err) {
      console.log('⚠️ Database connection failed (optional):', err.message);
    }

    try {
      await connectRedis();
      console.log('✅ Redis connected');
    } catch (err) {
      console.log('⚠️ Redis connection failed (optional):', err.message);
    }
    
    // 🎯 ОСНОВНОЙ ЗАПУСК - работает на любом порту
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 SOLAR v2.0 API Server running on port ${PORT}`);
      console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/health`);
      console.log(`📊 API Base: http://localhost:${PORT}/api/v2`);
      
      if (PORT === '10000') {
        console.log(`🌍 RENDER MODE: https://your-app.onrender.com`);
      } else {
        console.log(`💻 LOCAL MODE: Frontend should use http://localhost:4000`);
      }
    });
    
  } catch (error) {
    console.error(`❌ Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Process terminated');
  });
});

// Start server
if (require.main === module) {
  startServer();
}

module.exports = { app, server, io };
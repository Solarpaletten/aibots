const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token is required'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        subscriptionTier: true,
        voiceMinutesUsed: true,
        apiKeysUsed: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    // Add user to request object
    req.user = user;
    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Subscription tier middleware
const requireSubscription = (requiredTier) => {
  const tierLevels = {
    'FREE': 0,
    'PREMIUM': 1,
    'BUSINESS': 2
  };

  return (req, res, next) => {
    const userTier = req.user.subscriptionTier;
    const userLevel = tierLevels[userTier] || 0;
    const requiredLevel = tierLevels[requiredTier] || 0;

    if (userLevel < requiredLevel) {
      return res.status(403).json({
        success: false,
        error: `${requiredTier} subscription required`,
        currentTier: userTier,
        requiredTier: requiredTier
      });
    }

    next();
  };
};

// Usage limit middleware
const checkUsageLimit = (limitType) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      const limits = {
        FREE: {
          voiceMinutesPerMonth: 50,
          apiCallsPerMonth: 1000
        },
        PREMIUM: {
          voiceMinutesPerMonth: 1000,
          apiCallsPerMonth: 10000
        },
        BUSINESS: {
          voiceMinutesPerMonth: 10000,
          apiCallsPerMonth: 100000
        }
      };

      const userLimits = limits[user.subscriptionTier] || limits.FREE;

      if (limitType === 'voice' && user.voiceMinutesUsed >= userLimits.voiceMinutesPerMonth) {
        return res.status(429).json({
          success: false,
          error: 'Voice minute limit exceeded',
          usage: {
            used: user.voiceMinutesUsed,
            limit: userLimits.voiceMinutesPerMonth,
            remaining: Math.max(0, userLimits.voiceMinutesPerMonth - user.voiceMinutesUsed)
          }
        });
      }

      if (limitType === 'api' && user.apiKeysUsed >= userLimits.apiCallsPerMonth) {
        return res.status(429).json({
          success: false,
          error: 'API call limit exceeded',
          usage: {
            used: user.apiKeysUsed,
            limit: userLimits.apiCallsPerMonth,
            remaining: Math.max(0, userLimits.apiCallsPerMonth - user.apiKeysUsed)
          }
        });
      }

      next();
    } catch (error) {
      console.error('Usage limit check error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };
};

module.exports = {
  authMiddleware,
  requireSubscription,
  checkUsageLimit
};
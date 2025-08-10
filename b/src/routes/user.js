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

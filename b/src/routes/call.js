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

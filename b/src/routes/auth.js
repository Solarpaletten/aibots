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

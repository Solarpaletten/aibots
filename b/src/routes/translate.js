const express = require('express');
const router = express.Router();

router.post('/text', (req, res) => {
  res.json({ success: true, message: 'Text translation endpoint' });
});

router.post('/voice', (req, res) => {
  res.json({ success: true, message: 'Voice translation endpoint' });
});

module.exports = router;

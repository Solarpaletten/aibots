const express = require('express');
const router = express.Router();

router.post('/create', (req, res) => {
  res.json({ success: true, message: 'Call creation endpoint' });
});

module.exports = router;

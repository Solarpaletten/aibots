# Создаем недостающие файлы routes
cd b/src/routes/

# Создаем translate.js
cat > translate.js << 'EOF'
const express = require('express');
const router = express.Router();

router.post('/text', (req, res) => {
  res.json({ success: true, message: 'Text translation endpoint' });
});

router.post('/voice', (req, res) => {
  res.json({ success: true, message: 'Voice translation endpoint' });
});

module.exports = router;
EOF

# Создаем user.js
cat > user.js << 'EOF'
const express = require('express');
const router = express.Router();

router.get('/profile', (req, res) => {
  res.json({ success: true, message: 'User profile endpoint' });
});

module.exports = router;
EOF

# Создаем call.js  
cat > call.js << 'EOF'
const express = require('express');
const router = express.Router();

router.post('/create', (req, res) => {
  res.json({ success: true, message: 'Call creation endpoint' });
});

module.exports = router;
EOF
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');

// All voice agent routes require authentication
router.use(requireAuth);

// Main voice agent view
router.get('/', (req, res) => {
  res.render('voice/index', {
    title: 'Assistant Vocal - MeLorAly',
    currentPage: 'voice-agent'
  });
});

module.exports = router;

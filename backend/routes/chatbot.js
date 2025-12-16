const express = require('express');
const auth = require('../middleware/auth');
const chatbotService = require('../services/chatbotService');

const router = express.Router();

// POST /api/chatbot/message - Send message to chatbot
router.post('/message', auth, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const response = await chatbotService.handleMessage(req.userId, message);
    
    res.json({
      userMessage: message,
      botResponse: response.message,
      movies: response.movies || [],
      movie: response.movie || null
    });
  } catch (error) {
    console.error('Chatbot message error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// GET /api/chatbot/message - Alternative GET endpoint for simple queries
router.get('/message', auth, async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || !query.trim()) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }
    
    const response = await chatbotService.handleMessage(req.userId, query);
    
    res.json({
      userMessage: query,
      botResponse: response.message,
      movies: response.movies || [],
      movie: response.movie || null
    });
  } catch (error) {
    console.error('Chatbot query error:', error);
    res.status(500).json({ error: 'Failed to process query' });
  }
});

module.exports = router;

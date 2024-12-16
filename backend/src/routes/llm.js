const express = require('express');
const router = express.Router();
const LLMService = require('../services/llm');

router.post('/query', async (req, res) => {
    console.log('Received LLM query request:', req.body); // Debug log
    try {
        const { query } = req.body;
        console.log('Processing query:', query); // Debug log
        const result = await LLMService.queryDatabase(query);
        console.log('LLM result:', result); // Debug log
        res.json(result);
    } catch (error) {
        console.error('Error in LLM route:', error); // More detailed error logging
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
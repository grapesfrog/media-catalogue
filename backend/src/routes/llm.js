const express = require('express');
const router = express.Router();
const { getDb } = require('../../db/database');

router.post('/llm-search', async (req, res) => {
    const { query } = req.body;
    
    if (!query) {
        return res.status(400).json({ error: 'Query is required' });
    }

    try {
        // First get all media items from database
        const db = await getDb();
        const media = await db.all('SELECT * FROM media');
        
        // Format the media data for the LLM
        const mediaContext = media.map(item => 
            `Title: ${item.title}, Genre: ${item.genre}, Location: ${item.location}`
        ).join('\n');

        // Prepare the prompt for Llama
        const prompt = `
Given this media catalogue:
${mediaContext}

User question: ${query}

Return only the relevant items from the catalogue that answer the question. Format your response as a JSON array of objects with title, genre, and location fields.
`;

        // Call Ollama API
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama3.2',
                prompt: prompt,
                stream: false
            })
        });

        const llmResponse = await response.json();
        
        try {
            // Parse the LLM response as JSON
            const parsedResponse = JSON.parse(llmResponse.response);
            
            // Validate the response format
            if (Array.isArray(parsedResponse)) {
                res.json(parsedResponse);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (parseError) {
            console.error('Error parsing LLM response:', parseError);
            // Fallback to returning all media if LLM response is invalid
            res.json(media);
        }

    } catch (error) {
        console.error('LLM search error:', error);
        res.status(500).json({ 
            error: 'Failed to process natural language query',
            details: error.message
        });
    }
});

module.exports = router;
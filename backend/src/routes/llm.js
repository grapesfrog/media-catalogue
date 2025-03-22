const express = require('express');
const router = express.Router();

const API_BASE_URL = 'http://localhost:8080/api'; // adjust if needed

// Helper function to call the Ollama API
async function getLLMResponse(query) {
  // Build a strict prompt instructing Ollama to output only JSON.
  const prompt = `You are a data query assistant.
Based on the following query, return only a JSON array of records.
Each record is an object with keys "DVD Title", "Genre", "Location", and "Room".
Do not include any explanation or extra text—only return valid JSON.
Query: ${query}`;
  
  // Call Ollama (adjust the URL and model name as needed)
  try {
    const response = await fetch('http://localhost:11434/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "llama2", // Change this as needed for your setup
        prompt: prompt,
        max_tokens: 500,
        temperature: 0  // Lower temperature for more deterministic output
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Raw LLM response from Ollama:', data);

    // Verify we have an output string.
    if (!data || typeof data.output !== 'string') {
      throw new Error('failed to process your question: no valid output property');
    }

    return data.output.trim();
  } catch (error) {
    console.error('Error fetching response from Ollama:', error);
    throw error;
  }
}

router.post('/llm', async (req, res) => {
  try {
    const query = req.body.query;
    const rawResponse = await getLLMResponse(query);
    console.log('Raw response fetched:', rawResponse);

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(rawResponse);
    } catch (error) {
      console.error('Error parsing LLM response:', error);
      return res.status(500).json({
        error: 'Invalid JSON response from LLM',
        raw: rawResponse
      });
    }
    res.json(parsedResponse);
  } catch (error) {
    console.error('Error in LLM route:', error);
    res.status(500).json({ error: error.message });
  }
});

async function performNLQuery(query) {
  try {
    const response = await fetch(`${API_BASE_URL}/llm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    
    // Here we're getting the raw text first, so we can inspect it
    const raw = await response.text();
    console.log("Raw LLM response:", raw);
    
    // Parse as JSON
    try {
      return JSON.parse(raw);
    } catch (parseError) {
      console.error("Error parsing JSON from LLM response:", parseError);
      throw parseError;
    }
  } catch (error) {
    console.error("Natural language query error:", error);
    throw error;
  }
}

module.exports = router;
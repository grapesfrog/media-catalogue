const fetch = require('node-fetch');
const db = require('../database/db');

class LLMService {
    static async queryDatabase(userQuery) {
        try {
            console.log('Starting LLM query processing:', userQuery); // Debug log

            // Prompt engineering for the LLM
            const systemPrompt = `
                You are a SQL query generator. Convert natural language questions into SQL queries.
                The database has the following schema:
                - media (id, title, media_type_id, genre_id, location)
                - media_types (id, name)
                - genres (id, name)
                
                Rules:
                - Always join with media_types and genres to get names
                - Return clear, safe SQL queries
                - Only return the SQL query, no explanations
            `;

            const prompt = `${systemPrompt}\n\nUser question: "${userQuery}"\n\nSQL query:`;

            console.log('Sending request to Ollama:', prompt); // Debug log

            // Call Ollama API
            const response = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: "llama2",
                    prompt: prompt,
                    stream: false
                })
            });

            console.log('Received Ollama response:', response); // Debug log
            const data = await response.json();
            console.log('Parsed Ollama data:', data); // Debug log

            const sqlQuery = data.response.trim();
            console.log('Generated SQL query:', sqlQuery); // Debug log

            // Execute the generated SQL query
            return new Promise((resolve, reject) => {
                db.all(sqlQuery, [], (err, rows) => {
                    if (err) {
                        console.error('Database error:', err); // Debug log
                        reject(err);
                    } else {
                        console.log('Database results:', rows); // Debug log
                        resolve({
                            query: sqlQuery,
                            results: rows
                        });
                    }
                });
            });
        } catch (error) {
            console.error('Error in LLM service:', error); // More detailed error logging
            throw error;
        }
    }
}

module.exports = LLMService;
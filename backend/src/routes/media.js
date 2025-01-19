const express = require('express');
const router = express.Router();
const { getDb } = require('../../db/database');

// Get all media
router.get('/media', async (req, res) => {
    try {
        const db = await getDb();
        const media = await db.all('SELECT * FROM media ORDER BY title');
        res.json(media);
    } catch (error) {
        console.error('Error fetching media:', error);
        res.status(500).json({ error: 'Failed to fetch media' });
    }
});

// Search media
router.get('/media/search', async (req, res) => {
    const { title, genre } = req.query;
    try {
        const db = await getDb();
        let query = 'SELECT * FROM media WHERE 1=1';
        const params = [];

        if (title) {
            query += ' AND title LIKE ?';
            params.push(`%${title}%`);
        }
        if (genre) {
            query += ' AND genre = ?';
            params.push(genre);
        }

        query += ' ORDER BY title';
        const media = await db.all(query, params);
        res.json(media);
    } catch (error) {
        console.error('Error searching media:', error);
        res.status(500).json({ error: 'Failed to search media' });
    }
});

// Add new media
router.post('/media', async (req, res) => {
    const { title, genre, location } = req.body;
    
    if (!title || !genre || !location) {
        return res.status(400).json({ error: 'Title, genre, and location are required' });
    }

    try {
        const db = await getDb();
        const result = await db.run(
            'INSERT INTO media (title, genre, location, media_type) VALUES (?, ?, ?, ?)',
            [title, genre, location, 'DVD']
        );
        
        res.status(201).json({
            id: result.lastID,
            message: 'Media added successfully'
        });
    } catch (error) {
        console.error('Error adding media:', error);
        res.status(500).json({ error: 'Failed to add media' });
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const { getDb } = require('../../db/database');

// Get all media
router.get('/media', async (req, res) => {
    try {
        const db = await getDb();
        const media = await db.all('SELECT * FROM media ORDER BY "DVD Title"');
        console.log('Retrieved media:', media); // Debug log
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
            query += ' AND "DVD Title" LIKE ?';
            params.push(`%${title}%`);
        }
        if (genre) {
            query += ' AND "Genre" = ?';
            params.push(genre);
        }

        query += ' ORDER BY "DVD Title"';
        console.log('Search query:', query, 'params:', params); // Debug log
        
        const media = await db.all(query, params);
        console.log('Search results:', media); // Debug log
        
        res.json(media);
    } catch (error) {
        console.error('Error searching media:', error);
        res.status(500).json({ error: 'Failed to search media' });
    }
});

// Add new media
router.post('/media', async (req, res) => {
    const { title, genre, location, room } = req.body;
    
    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    try {
        const db = await getDb();
        const result = await db.run(
            'INSERT INTO media ("DVD Title", "Genre", "Location", "Room") VALUES (?, ?, ?, ?)',
            [title, genre, location, room]
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

// Delete single media
router.delete('/media/:id', async (req, res) => {
    try {
        const db = await getDb();
        await db.run('DELETE FROM media WHERE id = ?', req.params.id);
        res.json({ message: 'Media deleted successfully' });
    } catch (error) {
        console.error('Error deleting media:', error);
        res.status(500).json({ error: 'Failed to delete media' });
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const Media = require('../models/media');

router.get('/', async (req, res) => {
    try {
        const media = await Media.getAllMedia();
        res.json(media);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post('/', async (req, res) => {
    try {
        const { title, mediaTypeId, genreId, location } = req.body;
        const id = await Media.addMedia(title, mediaTypeId, genreId, location);
        res.status(201).json({ id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/genres', async (req, res) => {
    try {
        const genres = await Media.getGenres();
        res.json(genres);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post('/genres', async (req, res) => {
    try {
        const { name } = req.body;
        const id = await Media.addGenre(name);
        res.status(201).json({ id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/types', async (req, res) => {
    try {
        const types = await Media.getMediaTypes();
        res.json(types);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post('/types', async (req, res) => {
    try {
        const { name } = req.body;
        const id = await Media.addMediaType(name);
        res.status(201).json({ id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const { getDb } = require('../../db/database');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer with detailed error handling
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '.csv');
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Log incoming file details
        console.log('Incoming file:', {
            originalname: file.originalname,
            mimetype: file.mimetype
        });

        if (file.mimetype === 'text/csv' || 
            file.originalname.toLowerCase().endsWith('.csv') ||
            file.mimetype === 'application/vnd.ms-excel') {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only CSV files are allowed.'));
        }
    }
}).single('file');

// Wrap upload middleware in custom error handling
const handleUpload = (req, res, next) => {
    upload(req, res, function(err) {
        if (err instanceof multer.MulterError) {
            console.error('Multer error:', err);
            return res.status(400).json({
                error: 'File upload error',
                details: err.message
            });
        } else if (err) {
            console.error('Upload error:', err);
            return res.status(400).json({
                error: 'File upload error',
                details: err.message
            });
        }
        next();
    });
};

// CSV upload endpoint with improved error handling
router.post('/upload-csv', handleUpload, async (req, res) => {
    console.log('Upload request received');
    
    if (!req.file) {
        console.error('No file in request');
        return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('File received:', req.file);

    const results = [];
    let rowCount = 0;
    let headers = null;

    try {
        const db = await getDb();
        console.log('Database connection established');

        // Read and parse CSV file
        await new Promise((resolve, reject) => {
            fs.createReadStream(req.file.path)
                .on('error', (error) => {
                    console.error('File read error:', error);
                    reject(error);
                })
                .pipe(csv())
                .on('headers', (headerRow) => {
                    console.log('CSV Headers found:', headerRow);
                    headers = headerRow;
                    
                    // Validate that required columns exist
                    const requiredColumns = ['title', 'genre', 'location'];
                    const missingColumns = requiredColumns.filter(col => !headers.includes(col));
                    
                    if (missingColumns.length > 0) {
                        reject(new Error(`Missing required columns: ${missingColumns.join(', ')}. Found columns: ${headers.join(', ')}`));
                        return;
                    }
                })
                .on('data', (data) => {
                    rowCount++;
                    console.log(`Processing row ${rowCount}:`, data);
                    
                    // Validate required fields
                    if (!data.title || data.title.trim() === '') {
                        reject(new Error(`Row ${rowCount}: Title is empty or missing`));
                        return;
                    }
                    if (!data.genre || data.genre.trim() === '') {
                        reject(new Error(`Row ${rowCount}: Genre is empty or missing`));
                        return;
                    }
                    if (!data.location || data.location.trim() === '') {
                        reject(new Error(`Row ${rowCount}: Location is empty or missing`));
                        return;
                    }
                    results.push(data);
                })
                .on('end', () => {
                    console.log(`CSV parsing complete. ${results.length} rows processed`);
                    resolve();
                })
                .on('error', (error) => {
                    console.error('CSV parsing error:', error);
                    reject(error);
                });
        });

        // Begin database transaction
        console.log('Starting database transaction');
        await db.run('BEGIN TRANSACTION');

        // Process each row
        for (const row of results) {
            console.log('Inserting row:', {
                title: row.title,
                genre: row.genre,
                location: row.location
            });

            // Insert with explicit media_type value
            await db.run(
                `INSERT INTO media (title, genre, location, media_type) 
                 VALUES (?, ?, ?, ?)`,
                [
                    row.title,
                    row.genre,
                    row.location,
                    'DVD'  // Explicitly set default value
                ]
            );
        }

        // Commit transaction
        await db.run('COMMIT');
        console.log('Transaction committed successfully');

        // Clean up uploaded file
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
            console.log('Temporary file cleaned up');
        }

        res.json({
            message: 'CSV data imported successfully',
            rowsProcessed: results.length
        });

    } catch (error) {
        console.error('Error during import:', error);

        // Rollback transaction
        const db = await getDb();
        await db.run('ROLLBACK');
        console.log('Transaction rolled back');

        // Clean up uploaded file
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
            console.log('Temporary file cleaned up after error');
        }

        res.status(500).json({
            error: 'Failed to import CSV data',
            details: error.message,
            help: 'Make sure your CSV file has these columns: title, genre, location'
        });
    }
});

// Get all media (for admin table)
router.get('/media', async (req, res) => {
    try {
        const db = await getDb();
        const media = await db.all('SELECT * FROM media ORDER BY title');
        res.json(media);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to fetch media' });
    }
});

// Delete media endpoint
router.delete('/media/:id', async (req, res) => {
    try {
        const db = await getDb();
        const result = await db.run(
            'DELETE FROM media WHERE id = ?',
            [req.params.id]
        );
        
        if (result.changes > 0) {
            res.json({ message: 'Media deleted successfully' });
        } else {
            res.status(404).json({ error: 'Media not found' });
        }
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: 'Failed to delete media' });
    }
});

// Add this new route for bulk deletion
router.delete('/media/all', async (req, res) => {
    try {
        console.log('Attempting to delete all records');
        const db = await getDb();
        
        // Begin transaction
        await db.run('BEGIN TRANSACTION');
        
        // Delete all records
        await db.run('DELETE FROM media');
        
        // Commit transaction
        await db.run('COMMIT');
        
        console.log('All records deleted successfully');
        res.json({ message: 'All records deleted successfully' });
    } catch (error) {
        console.error('Error deleting all records:', error);
        
        // Rollback on error
        const db = await getDb();
        await db.run('ROLLBACK');
        
        res.status(500).json({ 
            error: 'Failed to delete all records',
            details: error.message 
        });
    }
});

module.exports = router;
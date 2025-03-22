const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const DB_PATH = '/Users/gracemollison/devtest/GitHub/media-catalogue/database/media.db';
const CSV_PATH = '/Users/gracemollison/devtest/GitHub/media-catalogue/database/media.csv';

// Connect to database
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        process.exit(1);
    }
    console.log('Connected to database');
});

async function importData() {
    try {
        // Drop existing table if it exists
        await new Promise((resolve, reject) => {
            db.run('DROP TABLE IF EXISTS media', (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        // Create new table with exact CSV column names
        await new Promise((resolve, reject) => {
            db.run(`
                CREATE TABLE media (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    "DVD Title" TEXT NOT NULL,
                    "Genre" TEXT,
                    "Location" TEXT,
                    "Room" TEXT
                )
            `, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        console.log('Table created, starting import...');

        // Read and import CSV data
        const records = [];
        await new Promise((resolve, reject) => {
            fs.createReadStream(CSV_PATH)
                .pipe(csv())
                .on('data', (row) => {
                    records.push(row);
                })
                .on('end', () => {
                    resolve();
                })
                .on('error', (err) => {
                    reject(err);
                });
        });

        console.log(`Found ${records.length} records to import`);

        // Insert records using exact column names
        const stmt = db.prepare(`
            INSERT INTO media ("DVD Title", "Genre", "Location", "Room")
            VALUES (?, ?, ?, ?)
        `);

        for (const record of records) {
            await new Promise((resolve, reject) => {
                stmt.run(
                    record['DVD Title'],
                    record['Genre'],
                    record['Location'],
                    record['Room'],
                    (err) => {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });
        }

        stmt.finalize();
        console.log('Import completed successfully');

        // Verify import
        const count = await new Promise((resolve, reject) => {
            db.get('SELECT COUNT(*) as count FROM media', (err, row) => {
                if (err) reject(err);
                else resolve(row.count);
            });
        });

        console.log(`Imported ${count} records`);

        // Show sample of imported data
        const sample = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM media LIMIT 1', (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        console.log('Sample record:', sample);

    } catch (error) {
        console.error('Error during import:', error);
    } finally {
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err);
            } else {
                console.log('Database connection closed');
            }
        });
    }
}

importData(); 
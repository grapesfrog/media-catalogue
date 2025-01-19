const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

let db = null;

async function initializeDb() {
    try {
        if (db) {
            return db;
        }

        db = await open({
            filename: path.join(__dirname, '../media.db'),
            driver: sqlite3.Database
        });

        // Create tables if they don't exist
        await db.exec(`
            CREATE TABLE IF NOT EXISTS media (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                media_type TEXT NOT NULL,
                genre TEXT NOT NULL,
                location TEXT NOT NULL
            )
        `);

        return db;
    } catch (error) {
        console.error('Database initialization error:', error);
        throw error;
    }
}

// Export both the database instance and the initialization function
module.exports = {
    getDb: async () => {
        if (!db) {
            db = await initializeDb();
        }
        return db;
    },
    initializeDb
};

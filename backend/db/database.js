const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

let db = null;

async function initializeDb() {
    if (db) {
        return db;
    }

    try {
        db = await open({
            filename: path.join(__dirname, '../../database/media.db'),
            driver: sqlite3.Database
        });

        console.log('Database connected successfully');
        return db;
    } catch (error) {
        console.error('Database initialization error:', error);
        throw error;
    }
}

function getDb() {
    if (!db) {
        throw new Error('Database not initialized. Call initializeDb first.');
    }
    return db;
}

module.exports = {
    initializeDb,
    getDb
};

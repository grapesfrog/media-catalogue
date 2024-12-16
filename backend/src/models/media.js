const db = require('../database/db');

class Media {
    static getAllMedia() {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    m.id, m.title, mt.name as media_type, g.name as genre, m.location
                FROM media m
                LEFT JOIN media_types mt ON m.media_type_id = mt.id
                LEFT JOIN genres g ON m.genre_id = g.id
            `;
            db.all(query, [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    }

    static addMedia(title, mediaTypeId, genreId, location) {
        return new Promise((resolve, reject) => {
            const query = `
                INSERT INTO media (title, media_type_id, genre_id, location)
                VALUES (?, ?, ?, ?)
            `;
            db.run(query, [title, mediaTypeId, genreId, location], function(err) {
                if (err) reject(err);
                resolve(this.lastID);
            });
        });
    }

    static getGenres() {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM genres', [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    }

    static getMediaTypes() {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM media_types', [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    }

    static addGenre(name) {
        return new Promise((resolve, reject) => {
            db.run('INSERT INTO genres (name) VALUES (?)', [name], function(err) {
                if (err) reject(err);
                resolve(this.lastID);
            });
        });
    }

    static addMediaType(name) {
        return new Promise((resolve, reject) => {
            db.run('INSERT INTO media_types (name) VALUES (?)', [name], function(err) {
                if (err) reject(err);
                resolve(this.lastID);
            });
        });
    }
}

module.exports = Media;
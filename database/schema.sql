CREATE TABLE media_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE genres (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    media_type_id INTEGER,
    genre_id INTEGER,
    location TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (media_type_id) REFERENCES media_types(id),
    FOREIGN KEY (genre_id) REFERENCES genres(id)
);

-- Insert initial media types
INSERT INTO media_types (name) VALUES ('DVD'), ('CD'), ('Blu-ray');

-- Insert some initial genres
INSERT INTO genres (name) VALUES 
    ('Action'), 
    ('Comedy'), 
    ('Drama'), 
    ('Science Fiction'),
    ('Documentary'),
    ('Anime'),
    ('Horror'),
    ('Thriller'),
    ('Romance'),
    ('Adventure'),
    ('Documentary'),
    ('Fantasy');
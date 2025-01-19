// Constants
const API_BASE_URL = 'http://localhost:8080/api';

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    setupEventListeners();
    loadAllMedia(); // Load media first
});

function setupEventListeners() {
    console.log('Setting up event listeners');
    
    // Add Media Form
    const addForm = document.getElementById('addMediaForm');
    if (addForm) {
        console.log('Found add media form');
        addForm.addEventListener('submit', async (e) => {
            console.log('Form submit triggered');
            e.preventDefault();
            await addMedia();
        });
    }

    // Search Button
    const searchButton = document.getElementById('searchButton');
    if (searchButton) {
        console.log('Found search button');
        searchButton.addEventListener('click', () => {
            console.log('Search button clicked');
            searchMedia();
        });
    }

    // NL Query Button
    const nlQueryButton = document.getElementById('nlQueryButton');
    if (nlQueryButton) {
        console.log('Found NL query button');
        nlQueryButton.addEventListener('click', () => {
            console.log('NL query button clicked');
            performNLQuery();
        });
    }

    // Search Input Enter Key
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        console.log('Found search input');
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                console.log('Search input enter pressed');
                searchMedia();
            }
        });
    }
}

async function addMedia() {
    console.log('Adding media...');
    const title = document.getElementById('title').value.trim();
    const genre = document.getElementById('genre').value.trim();
    const location = document.getElementById('location').value.trim();

    if (!title || !genre || !location) {
        alert('Please fill in all fields');
        return;
    }

    try {
        console.log('Sending add media request...');
        const response = await fetch(`${API_BASE_URL}/media`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title,
                genre,
                location
            })
        });

        console.log('Add media response:', response);
        const data = await response.json();

        if (response.ok) {
            alert('Media added successfully');
            document.getElementById('addMediaForm').reset();
            await loadAllMedia();
            updateGenreFilter(); // Update genre filter after adding new media
        } else {
            alert(`Failed to add media: ${data.message || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error adding media:', error);
        alert('Failed to add media. Please try again.');
    }
}

async function searchMedia() {
    console.log('Searching media...');
    const searchTerm = document.getElementById('searchInput').value;
    const selectedGenre = document.getElementById('filterGenre').value;

    try {
        let url = `${API_BASE_URL}/media/search?`;
        if (searchTerm) url += `title=${encodeURIComponent(searchTerm)}&`;
        if (selectedGenre) url += `genre=${encodeURIComponent(selectedGenre)}`;

        console.log('Search URL:', url);
        const response = await fetch(url);
        const media = await response.json();
        displayResults(media);
    } catch (error) {
        console.error('Search error:', error);
        alert('Failed to search media');
    }
}

async function performNLQuery() {
    console.log('Performing NL query...');
    const query = document.getElementById('nlQuery').value;
    if (!query) {
        alert('Please enter a question');
        return;
    }

    try {
        console.log('Sending NL query:', query);
        const response = await fetch(`${API_BASE_URL}/llm-search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query })
        });

        console.log('NL query response:', response);
        if (response.ok) {
            const results = await response.json();
            displayResults(results);
        } else {
            const error = await response.json();
            alert(`Search failed: ${error.message}`);
        }
    } catch (error) {
        console.error('Natural language query error:', error);
        alert('Failed to process your question');
    }
}

async function loadAllMedia() {
    console.log('Loading all media...');
    try {
        const response = await fetch(`${API_BASE_URL}/media`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const media = await response.json();
        displayResults(media);
        updateGenreFilter(media); // Update genre filter with available genres
    } catch (error) {
        console.error('Error loading media:', error);
    }
}

function updateGenreFilter(media = []) {
    const genreSelect = document.getElementById('filterGenre');
    if (!genreSelect) return;

    // Get unique genres from media
    const genres = [...new Set(media.map(item => item.genre))].sort();
    
    // Update genre select options
    genreSelect.innerHTML = '<option value="">All Genres</option>';
    genres.forEach(genre => {
        if (genre) { // Only add non-empty genres
            const option = document.createElement('option');
            option.value = genre;
            option.textContent = genre;
            genreSelect.appendChild(option);
        }
    });
}

function displayResults(media) {
    console.log('Displaying results:', media);
    const tbody = document.getElementById('resultsBody');
    if (!tbody) {
        console.error('Results table body not found');
        return;
    }

    tbody.innerHTML = '';

    if (!Array.isArray(media)) {
        console.error('Expected array of media items, got:', media);
        return;
    }

    media.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${escapeHtml(item.title)}</td>
            <td>${escapeHtml(item.genre)}</td>
            <td>${escapeHtml(item.location)}</td>
        `;
        tbody.appendChild(row);
    });
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
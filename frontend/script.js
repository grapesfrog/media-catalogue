const API_URL = 'http://localhost:3000/api';

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
    await loadMediaTypes();
    await loadGenres();
    await loadMedia();
});

// Load media types into select elements
async function loadMediaTypes() {
    try {
        const response = await fetch(`${API_URL}/media/types`);
        const mediaTypes = await response.json();
        
        const mediaTypeSelect = document.getElementById('mediaType');
        const filterMediaType = document.getElementById('filterMediaType');
        
        mediaTypes.forEach(type => {
            mediaTypeSelect.add(new Option(type.name, type.id));
            filterMediaType.add(new Option(type.name, type.id));
        });
    } catch (error) {
        console.error('Error loading media types:', error);
    }
}

// Load genres into select elements
async function loadGenres() {
    try {
        const response = await fetch(`${API_URL}/media/genres`);
        const genres = await response.json();
        
        const genreSelect = document.getElementById('genre');
        const filterGenre = document.getElementById('filterGenre');
        
        genres.forEach(genre => {
            genreSelect.add(new Option(genre.name, genre.id));
            filterGenre.add(new Option(genre.name, genre.id));
        });
    } catch (error) {
        console.error('Error loading genres:', error);
    }
}

// Load and display all media
async function loadMedia() {
    try {
        const response = await fetch(`${API_URL}/media`);
        const media = await response.json();
        displayResults(media);
    } catch (error) {
        console.error('Error loading media:', error);
    }
}

// Handle form submission
document.getElementById('addMediaForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        title: document.getElementById('title').value,
        mediaTypeId: document.getElementById('mediaType').value,
        genreId: document.getElementById('genre').value,
        location: document.getElementById('location').value
    };

    try {
        const response = await fetch(`${API_URL}/media`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            alert('Media added successfully!');
            document.getElementById('addMediaForm').reset();
            await loadMedia();
        } else {
            alert('Error adding media');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error adding media');
    }
});

// Search functionality
async function searchMedia() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const mediaTypeFilter = document.getElementById('filterMediaType').value;
    const genreFilter = document.getElementById('filterGenre').value;

    try {
        const response = await fetch(`${API_URL}/media`);
        let media = await response.json();

        // Apply filters
        media = media.filter(item => {
            const matchesSearch = item.title.toLowerCase().includes(searchTerm);
            const matchesMediaType = !mediaTypeFilter || item.media_type_id == mediaTypeFilter;
            const matchesGenre = !genreFilter || item.genre_id == genreFilter;
            return matchesSearch && matchesMediaType && matchesGenre;
        });

        displayResults(media);
    } catch (error) {
        console.error('Error searching media:', error);
    }
}

// Display results in the table
function displayResults(media) {
    const tbody = document.getElementById('resultsBody');
    tbody.innerHTML = '';

    media.forEach(item => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = item.title;
        row.insertCell(1).textContent = item.media_type;
        row.insertCell(2).textContent = item.genre;
        row.insertCell(3).textContent = item.location;
    });
}

async function askLLM() {
    const query = document.getElementById('llmQuery').value;
    console.log('Query submitted:', query); // Debug log
    
    try {
        console.log('Sending request to:', `${API_URL}/llm/query`); // Debug log
        const response = await fetch(`${API_URL}/llm/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query })
        });

        console.log('Response received:', response); // Debug log
        const data = await response.json();
        console.log('Parsed data:', data); // Debug log
        
        // Display the SQL query
        document.getElementById('sqlQuery').textContent = data.query;
        
        // Display the results
        displayLLMResults(data.results);
    } catch (error) {
        console.error('Error in askLLM:', error); // More detailed error logging
        alert('Error processing your question');
    }
}

function displayLLMResults(results) {
    if (!results || results.length === 0) {
        document.getElementById('llmResultsTable').style.display = 'none';
        return;
    }

    const thead = document.getElementById('llmResultsHead');
    const tbody = document.getElementById('llmResultsBody');
    
    // Clear previous results
    thead.innerHTML = '';
    tbody.innerHTML = '';
    
    // Create headers
    const headerRow = thead.insertRow();
    Object.keys(results[0]).forEach(key => {
        const th = document.createElement('th');
        th.textContent = key;
        headerRow.appendChild(th);
    });
    
    // Add data rows
    results.forEach(result => {
        const row = tbody.insertRow();
        Object.values(result).forEach(value => {
            row.insertCell().textContent = value;
        });
    });
    
    document.getElementById('llmResultsTable').style.display = 'table';
}
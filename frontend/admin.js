// Constants
const API_BASE_URL = 'http://localhost:8080/api';

// Explicitly attach to window object
window.deleteAllRecords = function() {
    console.log('deleteAllRecords called');
    
    if (!confirm('Are you sure you want to delete ALL records? This cannot be undone!')) {
        return;
    }

    fetch(`${API_BASE_URL}/admin/media/all`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        console.log('Delete response:', response);
        if (!response.ok) {
            return response.json().then(err => {
                throw new Error(err.message || 'Failed to delete records');
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Delete successful:', data);
        alert('All records deleted successfully');
        loadAdminMedia();
    })
    .catch(error => {
        console.error('Delete error:', error);
        alert(`Failed to delete records: ${error.message}`);
    });
};

// Load initial data
document.addEventListener('DOMContentLoaded', () => {
    console.log('Admin page loaded');
    setupAdminEventListeners();
    loadAdminMedia();
});

function setupAdminEventListeners() {
    const deleteAllButton = document.getElementById('deleteAllButton');
    if (deleteAllButton) {
        console.log('Found delete all button');
        deleteAllButton.addEventListener('click', () => {
            console.log('Delete all button clicked');
            deleteAllRecords();
        });
    }

    const csvForm = document.getElementById('csvUploadForm');
    if (csvForm) {
        console.log('Found CSV form');
        csvForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('CSV form submitted');
            handleCsvUpload(e);
        });
    }
}

async function handleCsvUpload(event) {
    const fileInput = document.getElementById('csvFile');
    const file = fileInput.files[0];
    if (!file) {
        alert('Please select a CSV file');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        const uploadStatus = document.getElementById('uploadStatus');
        uploadStatus.textContent = 'Uploading...';

        const response = await fetch(`${API_BASE_URL}/upload-csv`, {
            method: 'POST',
            body: formData
        });

        console.log('Upload response:', response);
        const result = await response.json();

        if (response.ok) {
            uploadStatus.textContent = 'Upload successful!';
            await loadAdminMedia(); // Refresh the table
            fileInput.value = ''; // Clear the file input
        } else {
            throw new Error(result.error || 'Upload failed');
        }
    } catch (error) {
        console.error('Upload error:', error);
        const uploadStatus = document.getElementById('uploadStatus');
        uploadStatus.textContent = `Upload failed: ${error.message}`;
    }
}

async function loadAdminMedia() {
    console.log('Loading admin media...');
    try {
        const response = await fetch(`${API_BASE_URL}/media`);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Loaded media data:', data);
        
        // Check if data is an array
        if (!Array.isArray(data)) {
            console.error('Expected array but got:', typeof data);
            alert('Failed to load media: Data format is incorrect.');
            return;
        }

        // Handle empty array case
        if (data.length === 0) {
            console.warn('No media records found.');
            alert('No media records found.');
            return;
        }
        
        displayResults(data);
    } catch (error) {
        console.error('Error loading media:', error);
        alert('Failed to load media list');
    }
}

function displayResults(media) {
    console.log('Displaying results:', media);
    const tbody = document.getElementById('adminMediaBody');
    if (!tbody) {
        console.error('Results table body not found');
        return;
    }

    tbody.innerHTML = '';

    media.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${escapeHtml(item['DVD Title'] || '')}</td>
            <td>${escapeHtml(item['Genre'] || '')}</td>
            <td>${escapeHtml(item['Location'] || '')}</td>
            <td>${escapeHtml(item['Room'] || '')}</td>
            <td>
                <button onclick="deleteMedia(${item.id})" class="delete-btn">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Individual delete function
async function deleteMedia(id) {
    console.log('Attempting to delete media with id:', id);
    if (!confirm('Are you sure you want to delete this item?')) {
        console.log('User cancelled single item deletion');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/admin/media/${id}`, {
            method: 'DELETE'
        });
        console.log('Single delete response:', response);

        if (response.ok) {
            console.log('Item deleted, reloading media list');
            await loadAdminMedia();
        } else {
            const error = await response.json();
            throw new Error(error.message);
        }
    } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete item');
    }
}

function escapeHtml(unsafe) {
    if (unsafe === null || unsafe === undefined) return '';
    return unsafe
        .toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

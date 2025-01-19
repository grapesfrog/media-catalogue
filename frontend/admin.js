// Constants for API configuration
const API_BASE_URL = 'http://localhost:8080/api/admin';

document.addEventListener('DOMContentLoaded', () => {
    loadAdminMedia();
    setupCSVUpload();
});

function setupCSVUpload() {
    const form = document.getElementById('csvUploadForm');
    const fileInput = document.getElementById('csvFile');
    const uploadStatus = document.getElementById('uploadStatus');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const file = fileInput.files[0];
        if (!file) {
            alert('Please select a CSV file');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            uploadStatus.textContent = 'Uploading...';
            uploadStatus.className = 'status-message uploading';
            
            const response = await fetch(`${API_BASE_URL}/upload-csv`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                uploadStatus.textContent = `Upload successful! ${result.rowsProcessed} rows processed.`;
                uploadStatus.className = 'status-message success';
                loadAdminMedia();
                form.reset();
            } else {
                uploadStatus.textContent = `Upload failed: ${result.error}`;
                uploadStatus.className = 'status-message error';
            }
        } catch (error) {
            console.error('Upload error:', error);
            uploadStatus.textContent = 'Upload failed. Please try again.';
            uploadStatus.className = 'status-message error';
        }
    });
}

async function loadAdminMedia() {
    const tableBody = document.getElementById('adminMediaBody');
    
    try {
        const response = await fetch(`${API_BASE_URL}/media`);
        const media = await response.json();

        tableBody.innerHTML = '';
        media.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${escapeHtml(item.title)}</td>
                <td>${escapeHtml(item.media_type)}</td>
                <td>${escapeHtml(item.genre)}</td>
                <td>${escapeHtml(item.location)}</td>
                <td>
                    <button onclick="deleteMedia(${item.id})" class="delete-btn">
                        Delete
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading media:', error);
        alert('Failed to load media list');
    }
}

async function deleteMedia(id) {
    if (!confirm('Are you sure you want to delete this item?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/media/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadAdminMedia();
        } else {
            const error = await response.json();
            alert(`Delete failed: ${error.message}`);
        }
    } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete item');
    }
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

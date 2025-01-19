

Let me explain the relationship between the frontend and backend in your application:

### Architecture Overview
```
Frontend (localhost:3000)                 Backend (localhost:8080)
[HTML/CSS/JavaScript] <----------------> [Node.js/Express/SQLite]
```

### Communication Flow:

1. **Frontend (localhost:3000)**
   - Served by Python's simple HTTP server
   - Start with `python -m http.server 3000` ( cd into the frontend directory)
   - Contains:
     - `index.html` - User interface
     - `script.js` - Handles user interactions and API calls
     - `styles.css` - Styling
   - Makes API requests to backend using `fetch()`

2. **Backend (localhost:8080)**
   - Runs on Node.js with Express
   - Handles:
     - Database operations (SQLite)
     - API endpoints
     - Business logic
     - LLM integration (Ollama)
   - Start with `npm run dev` ( cd into the backend directory)

### Key Interactions:

1. **Adding Media**
```javascript
Frontend: script.js
fetch(`${API_BASE_URL}/media`, {
    method: 'POST',
    body: JSON.stringify({title, genre, location})
})
    ↓
Backend: /api/media
router.post('/media', async (req, res) => {
    // Saves to SQLite database
})
```

2. **Searching Media**
```javascript
Frontend: script.js
fetch(`${API_BASE_URL}/media/search?title=${searchTerm}`)
    ↓
Backend: /api/media/search
router.get('/media/search', async (req, res) => {
    // Queries SQLite database
})
```

3. **Natural Language Queries**
```javascript
Frontend: script.js
fetch(`${API_BASE_URL}/llm-search`, {
    method: 'POST',
    body: JSON.stringify({query})
})
    ↓
Backend: /api/llm-search
router.post('/llm-search', async (req, res) => {
    // 1. Gets data from SQLite
    // 2. Sends to Ollama
    // 3. Returns results
})
```

### CORS (Cross-Origin Resource Sharing):
- Frontend and backend run on different ports
- Backend must allow requests from frontend:
```javascript
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'DELETE']
}));
```

### Data Flow:
1. User interacts with frontend
2. Frontend makes API request to backend
3. Backend processes request
4. Backend returns JSON response
5. Frontend updates UI with results

This separation allows for:
- Independent development/deployment
- Better scalability
- Clear separation of concerns
- Different technologies for different purposes

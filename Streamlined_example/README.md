# DVD Collection Chatbot

A simple web application that allows you to query your DVD collection using natural language through a chat interface. The application uses Ollama for natural language processing and PostgreSQL for data storage.

## Features

- Natural language queries for your DVD collection
- Interactive chat interface
- Searches across multiple fields (title, genre, location, room)
- Case-insensitive and flexible matching
- Results displayed in a formatted table

## Prerequisites

- Python 3.8+
- PostgreSQL
- Ollama (with model of your choice installed)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cursor-dvdpicker
```

2. Create a virtual environment and activate it:
```bash
python -m venv venv
source venv/bin/activate  # On Unix/macOS
# or
.\venv\Scripts\activate  # On Windows
```

3. Install the required packages:
```bash
pip install -r requirements.txt
```

4. Make sure Ollama is installed and running with the model of your choice:
```bash
ollama serve
ollama pull [model of your choice]
```

5. Set up the PostgreSQL database:
```bash
# Create the database and user as defined in create_db.py
psql -U postgres
CREATE DATABASE media;
CREATE USER admin WITH PASSWORD 'media';
GRANT ALL PRIVILEGES ON DATABASE media TO admin;
```

## Configuration

The database configuration is in `app.py`. Update these settings if needed:
```python
DB_CONFIG = {
    "host": "localhost",
    "database": "media",
    "user": "YOUR-USERNAME",
    "password": "YOUR-PASSWORD",
    "port": "5432"
}
```

## Running the Application

1. Start the Flask application:
```bash
python app.py
```

2. Open your web browser and navigate to:
```
http://localhost:5000
```

## Example Queries

The chatbot understands various types of queries:

- "Do we have any fantasy films?"
- "What movies are in the living room?"
- "Show me all anime"
- "Do we have Barbarella?"
- "Any action movies in the bedroom?"

## Project Structure

```
cursor-dvdpicker/
├── app.py              # Main application file
├── requirements.txt    # Python dependencies
├── README.md          # This file
├── dbase/
│   └── create_db.py   # Database creation script
└── templates/
    └── index.html     # Web interface template
```

## Troubleshooting

1. If the page is blank:
   - Check that the templates folder exists and contains index.html
   - Verify Flask is running without errors

2. If queries return no results:
   - Verify PostgreSQL is running
   - Check database connection settings
   - Ensure the dvds table has data

3. If Ollama isn't responding:
   - Verify Ollama is running (`ollama serve`)
   - Check that the model of your choice is installed (`ollama list`)

## Dependencies

- Flask: Web framework
- langchain: LLM integration
- psycopg2-binary: PostgreSQL adapter
- python-dotenv: Environment variable management

## License

[apache License 2.0](https://github.com/apache/.github/blob/main/LICENSE)

## Contributing

This is purely for demo purposes no contributions are accepted
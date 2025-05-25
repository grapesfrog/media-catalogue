# How the Streamlined DVD Collection Chatbot Works

This document explains the architecture and workflow of the Streamlined DVD Collection Chatbot example.

## Overview

The application is a simple web-based chatbot that allows users to query their DVD collection using natural language. For example, you can ask "Do we have any fantasy films?" or "What movies are in the living room?". The application interprets the question, searches a PostgreSQL database, and displays the results.

## Components

The application consists of three main components: a frontend web interface, a backend Flask application, and a PostgreSQL database.

### 1. Frontend (Web Interface)

*   **File**: `Streamlined_example/templates/index.html`
*   **Function**: Provides the user interface for the chatbot. Users type their questions into a chat window.
*   **Technology**: HTML, CSS, and JavaScript (though the specifics of the frontend JS are not detailed in `index.html`, it handles sending requests to the backend and displaying responses).

### 2. Backend (Flask Application)

*   **File**: `Streamlined_example/app.py`
*   **Framework**: Flask (a Python web framework)
*   **Key Functions**:
    *   **Handles User Queries**: The `/chat` API endpoint receives user messages sent from the frontend.
    *   **Natural Language Processing (NLP)**:
        *   It uses the **Ollama** library to interact with a locally running Large Language Model (LLM), such as `gemma3` (this can be configured to other models Ollama supports).
        *   The **`langchain`** library is used to structure the interaction with the LLM.
        *   A **Prompt Template** (`PROMPT_TEMPLATE` in `app.py`) guides the LLM to convert the user's natural language question into a PostgreSQL SQL query. This template includes instructions on how to interpret questions related to genres, locations, etc., and specifies the table name (`dvds`) and its columns.
    *   **SQL Query Generation and Cleaning**:
        *   The LLM generates an SQL query based on the user's question and the prompt.
        *   The `clean_sql_query` function in `app.py` refines this SQL query:
            *   It removes any markdown formatting (like ```sql ... ```) that the LLM might add.
            *   It ensures that text comparisons are case-insensitive by using `ILIKE` instead of `LIKE`.
            *   It automatically adds wildcard characters (`%`) to `ILIKE` conditions for more flexible matching (e.g., `ILIKE '%search_term%'`).
    *   **Database Interaction**:
        *   The `query_database` function executes the cleaned SQL query against the PostgreSQL database using the `psycopg2` library.
    *   **Flexible Search (Fallback)**:
        *   If the initial LLM-generated query returns no results, the application attempts a more flexible search.
        *   It breaks down the user's original message into significant keywords.
        *   It then constructs a new SQL query that searches for these keywords across multiple columns (`title`, `genre`, `location`, `room`) using `ILIKE` and `OR` conditions. This helps find relevant DVDs even if the initial, more specific query failed.
    *   **Response**: The backend sends the query results (or an error message) back to the frontend in JSON format.

### 3. Database (PostgreSQL)

*   **Database Name**: `media`
*   **Table Name**: `dvds`
*   **Setup Script**: `Streamlined_example/dbase/create_db.py`
    *   This Python script handles:
        1.  Creating the `media` database (if it doesn't exist).
        2.  Creating the `dvds` table with the following columns:
            *   `title` (VARCHAR): The title of the DVD.
            *   `genre` (VARCHAR): The genre of the DVD (e.g., Action, Fantasy, Anime).
            *   `location` (VARCHAR): Specific storage location (e.g., Shelf A, Box 3).
            *   `room` (VARCHAR): The room where the DVD is located (e.g., Living Room, Bedroom).
        3.  Populating the `dvds` table from a CSV file named `dvds.csv`, which is expected to be in the `Streamlined_example/dbase/` directory. The CSV should have columns corresponding to the table structure.
*   **Database Configuration**: Connection parameters (host, database name, user, password, port) are defined in `app.py` (for the Flask app) and `dbase/create_db.py` (for the setup script). **Note:** These contain placeholder credentials and need to be updated for a real setup.

## Workflow Summary

1.  **User Input**: The user types a question into the chat interface in `index.html`.
2.  **Request to Backend**: The frontend sends the question to the `/chat` endpoint of the Flask backend (`app.py`).
3.  **NLP to SQL**: The backend uses Ollama (via `langchain`) and a predefined prompt to translate the natural language question into an SQL query.
4.  **SQL Cleaning**: The generated SQL query is cleaned and optimized for case-insensitive, flexible matching.
5.  **Database Query**: The cleaned SQL query is executed against the `dvds` table in the `media` PostgreSQL database.
6.  **Fallback Search (if needed)**: If no results are found, a broader, keyword-based search is performed across multiple columns.
7.  **Response to Frontend**: The backend returns the search results (or an error message) as JSON to the frontend.
8.  **Display Results**: The frontend JavaScript displays the results in the chat interface.

## Setup & Dependencies

*   **Python Dependencies**: Listed in `Streamlined_example/requirements.txt` (includes Flask, langchain, Ollama, psycopg2-binary).
*   **External Services**:
    *   **PostgreSQL**: Must be installed and running.
    *   **Ollama**: Must be installed, running (`ollama serve`), and have a model downloaded (e.g., `ollama pull gemma3`).
*   **Detailed Setup**: For comprehensive setup instructions (installing dependencies, setting up the database, running the application), please refer to the `Streamlined_example/README.md` file.

This explanation should provide a clear understanding of how the streamlined example application functions.

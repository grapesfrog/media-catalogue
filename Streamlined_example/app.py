from flask import Flask, render_template, request, jsonify
from langchain_community.llms import Ollama
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
import psycopg2
from psycopg2.extras import RealDictCursor

app = Flask(__name__)

# Database connection parameters
DB_CONFIG = {
    "host": "localhost",
    "database": "media",
    "user": "YOUR-USERNAME",
    "password": "YOUR-PASSWORD",
    "port": "5432"
}

def get_db_connection():
    """Create a database connection"""
    return psycopg2.connect(**DB_CONFIG)

def query_database(query):
    """Execute a database query and return results"""
    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(query)
                return cur.fetchall()
    except Exception as e:
        return f"Database error: {str(e)}"

def clean_sql_query(query):
    """Remove markdown formatting and clean the SQL query"""
    # Remove markdown code blocks
    query = query.replace('```sql', '').replace('```', '').strip()
    # Remove any leading/trailing whitespace and ensure single spaces
    query = ' '.join(query.split())
    # Ensure proper ILIKE syntax
    if 'LIKE' in query and 'ILIKE' not in query:
        query = query.replace('LIKE', 'ILIKE')
    # Add wildcards if missing in ILIKE clauses
    if 'ILIKE' in query and '%' not in query:
        query = query.replace("ILIKE '", "ILIKE '%").replace("'", "%'")
    return query

# Initialize Ollama
llm = Ollama(model="gemma3")

# Create prompt template for database queries
PROMPT_TEMPLATE = """
You are a helpful assistant that generates PostgreSQL queries for a DVD database.
The database has a table named 'dvds' with these columns:
- title: The name of the movie
- genre: The movie's genre (e.g., Action, Fantasy, Anime, Comedy)
- location: Where the DVD is stored
- room: Which room it's in

Important rules for generating queries:
1. When searching for genres, use the genre column, not title
2. When searching for locations, use the location or room columns
3. Use ILIKE for all text comparisons to make them case-insensitive
4. Always use % wildcards for flexible matching

Example queries:
- For "any fantasy films": SELECT * FROM dvds WHERE genre ILIKE '%fantasy%'
- For "movies in living room": SELECT * FROM dvds WHERE room ILIKE '%living%room%'
- For "blade runner": SELECT * FROM dvds WHERE title ILIKE '%blade%runner%'
- For "action movies in bedroom": SELECT * FROM dvds WHERE genre ILIKE '%action%' AND room ILIKE '%bedroom%'

User question: {question}

Generate a single PostgreSQL query to answer this question.
Return ONLY the raw SQL query without any markdown formatting, quotes, or additional text.
Remember to search the appropriate columns (genre for genre searches, title for titles, etc).
"""

prompt = PromptTemplate(
    input_variables=["question"],
    template=PROMPT_TEMPLATE
)

chain = LLMChain(llm=llm, prompt=prompt)

@app.route('/')
def home():
    try:
        print("Attempting to render template...")  # Debug print
        result = render_template('index.html')
        print("Template rendered successfully")    # Debug print
        return result
    except Exception as e:
        print(f"Error rendering template: {e}")
        return "Hello World - This is a test response", 200

@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.json.get('message', '')
    
    try:
        # Generate SQL query using LLM
        sql_query = chain.run(user_message)
        
        # Clean and enhance the SQL query
        sql_query = clean_sql_query(sql_query)
        
        print(f"Generated SQL query: {sql_query}")  # Debug print
        
        # Execute the query
        results = query_database(sql_query)
        
        # Format results for display
        if isinstance(results, list):
            if not results:
                # If no exact results, try a more flexible search across multiple columns
                search_terms = user_message.lower().replace('called', '').replace('named', '').split()
                search_terms = [term for term in search_terms if len(term) > 2 and term not in 
                              {'any', 'the', 'are', 'there', 'have', 'does', 'film', 'films', 'movie', 'movies'}]
                
                if search_terms:
                    # Create conditions for each relevant column
                    column_conditions = []
                    for term in search_terms:
                        column_conditions.extend([
                            f"title ILIKE '%{term}%'",
                            f"genre ILIKE '%{term}%'",
                            f"location ILIKE '%{term}%'",
                            f"room ILIKE '%{term}%'"
                        ])
                    
                    flexible_conditions = " OR ".join(column_conditions)
                    flexible_query = f"SELECT * FROM dvds WHERE {flexible_conditions}"
                    print(f"Trying flexible query: {flexible_query}")  # Debug print
                    results = query_database(flexible_query)
            
            response = {
                'query': sql_query,
                'results': results
            }
        else:
            response = {
                'query': sql_query,
                'error': results
            }
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    try:
        # Test database connection
        print("Testing database connection...")
        conn = get_db_connection()
        conn.close()
        print("Database connection successful!")

        # Test Ollama connection
        print("Testing Ollama connection...")
        response = llm.invoke("test")
        print("Ollama connection successful!")

        # Start the Flask app
        print("Starting Flask application...")
        app.run(debug=True, port=5000)
    except psycopg2.Error as e:
        print(f"Database connection failed: {e}")
    except Exception as e:
        print(f"Application failed to start: {e}")
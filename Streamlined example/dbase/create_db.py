import psycopg2
import csv

# Database connection parameters
DB_HOST = "localhost"  # Or your PostgreSQL server's address
DB_NAME = "media" #updated database name
DB_USER = "admin"
DB_PASSWORD = "media"
DB_PORT = "5432" #Default port, but explicitly defined.

# CSV file path
CSV_FILE = "dvds.csv"  # Replace with your CSV file's path

def create_database():
    """Creates the PostgreSQL database."""
    try:
        # Connect without specifying a database to create it.
        conn = psycopg2.connect(host=DB_HOST, user=DB_USER, password=DB_PASSWORD, port=DB_PORT, database="postgres") #connect to the default postgres database to create a new one.
        conn.autocommit = True #crucial for creating a database
        cur = conn.cursor()

        cur.execute(f"CREATE DATABASE {DB_NAME};")
        print(f"Database '{DB_NAME}' created successfully.")

        cur.close()
        conn.close()

    except psycopg2.Error as e:
        print(f"Error creating database: {e}")

def create_table():
    """Creates the 'dvds' table."""
    try:
        conn = psycopg2.connect(host=DB_HOST, database=DB_NAME, user=DB_USER, password=DB_PASSWORD, port=DB_PORT)
        cur = conn.cursor()

        cur.execute("""
            CREATE TABLE IF NOT EXISTS dvds (
                title VARCHAR(255),
                genre VARCHAR(255),
                location VARCHAR(255),
                room VARCHAR(255)
            );
        """)

        conn.commit()
        cur.close()
        conn.close()
        print("Table 'dvds' created successfully.")

    except psycopg2.Error as e:
        print(f"Error creating table: {e}")

def populate_table():
    """Populates the 'dvds' table from the CSV file."""
    try:
        conn = psycopg2.connect(host=DB_HOST, database=DB_NAME, user=DB_USER, password=DB_PASSWORD, port=DB_PORT)
        cur = conn.cursor()

        with open(CSV_FILE, 'r', encoding='utf-8') as file: #added encoding to handle various characters.
            reader = csv.reader(file)
            next(reader)  # Skip the header row

            for row in reader:
                cur.execute("INSERT INTO dvds (title, genre, location, room) VALUES (%s, %s, %s, %s);", row)

        conn.commit()
        cur.close()
        conn.close()
        print("Table 'dvds' populated successfully.")

    except psycopg2.Error as e:
        print(f"Error populating table: {e}")
    except FileNotFoundError:
        print(f"Error: CSV file '{CSV_FILE}' not found.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    create_database()
    create_table()
    populate_table()
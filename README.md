# A  web solution that catalogues dvds, cds and blueray discs.

The catalogue records title, genre, media type and location.

The solution will integrate with a local llm using ollama to provide a NLP interface to query the structured data .

Sqlite is the database used to store the data.
The solution requires the ability to add new media and genre types

The web front end should be written in node .

The data is added to the database via backend code written in node.js
The image capture uses a vision/ multimodal llm 
 to identify media in an uploaded image that is labelled  with the location.
 The identified media are  added to the database categorising each media identified
 appropriately
## Admin Interface

The admin interface provides functionality to manage the media database:

### Bulk Upload via CSV
- Upload CSV files containing media records to append to the database
- Required CSV columns: title, genre, location 
- Optional column: media_type (defaults to 'DVD' if not provided)
- Data validation is performed before inserting records
- Duplicate records are skipped based on title + media_type combination

### Media Management 
- View all media records in a paginated table
- Delete individual media records
- Search/filter capabilities to find specific records

### Implementation Details
The admin interface is implemented as a protected route requiring authentication. Key components:

Frontend:
- React-based admin dashboard
- CSV file upload component with progress indicator
- Data table with delete functionality
- Search and filter controls

Backend:
- POST /api/admin/upload-csv endpoint for bulk imports
  - Handles CSV files with or without media_type column
  - Automatically sets media_type='DVD' when column is missing
- DELETE /api/admin/media/:id endpoint for deletions
- Input validation and sanitization
- Database transaction handling for data integrity

Security:
- Admin authentication required
- CSRF protection
- Input validation
- Rate limiting on API endpoints

TODO
-  Add more feedback to the user
- Add controls to valiadte that the csv is correctly formated ( i.e data types are correct)
- Tidy up the admin interface
- Add code to delete all records



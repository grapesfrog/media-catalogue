# A web solution that catalogues dvds,cds and blueray discs.

The catalogue records title, genre, media type and location.

The solution integrates with a local llm using ollama to provide a NLP interface 
to query the structured data .

Sqlite is the database used to store the data.
The solution requires the ability to add new media and genre types

TODO:

The majority of the data is added to the database via another containerised
 solution written in python which uses a local  vision llm managed by ollama
 to identify media in an uploaded image that is labelled  with the location.
 The identified media are  added to the database categorising each media identified
 appropriately

This application has been developed by prompting Cursor using Claude-3.5-sonnet
The human in the loop provided the prompts and original requirements 

## Running the application

The application is split into a frontend and backend to start the application use the following commands:

### Backend
cd media-catalogue/backend 

npm run dev

### Frontend
cd media-catalogue/frontend

python3 -m http.server 8080


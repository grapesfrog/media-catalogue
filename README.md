# A containerised  web solution that catalogues dvds, cds and blueray discs.

The catalogue records title, genre, media type and location.

The solution will integrate with a local llm using ollama to provide a NLP interface 
to query the structured data .

Sqlite is the database used to store the data.
The solution requires the ability to add new media and genre types

The web front end should be written in node .

The majority of the data is added to the database via another containerised
 solution written in python which uses a local  vision llm managed by ollama
 to identify media in an uploaded image that is labelled  with the location.
 The identified media are  added to the database categorising each media identified
 appropriately

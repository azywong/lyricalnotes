# lyricalnotes

## Web portion

### purpose
to host our project's data visualization portion

### location
located in /docs folder


## Node.js App

### purpose
gets song chart data from http://billboard.modulo.site/

and accompanying lyrics data from https://orion.apiseeds.com/ and https://github.com/rhnvrm/lyric-api	

currently it is limited to 1990-2015

### config.js
needs a config file that contains the follow.  Replace key with your API key from https://orion.apiseeds.com/

```
var config = {
	APISEEDS_KEY: "key"
}

module.exports = config;
```

### getting started

`node app.js`

### node.js end points
/lyrics/:fileName

	- where fileName is the name of a file with all the data from a certain billboard date
	- this will go through and get the lyrics from the songs on that date's list.
	- each song file is saved as <songid>-lyrics.json

/alldates

	- Will get the full range of the billboard data set from 1958-8-9 to end of 2015
	- The unoffical billboard API only takes Saturdays, so thats factored in
	- Currently values are hard coded, but may be changed to take a dynamic range in the future
	- Each API call is saved as <date>.json


/date/:date

	- where date is the date in the format that the billboard api wants
	- files are saved as <date>.json


/alllyrics

	- gets all lyrics from a hard coded starting date to a hard coded end date
	- requires the complete corresponding billboard weeks files
	- each song file is saved as <song id>-lyrics.json


/missinglyrics

	- looks at all billboard weeks from a hard coded starting date to a hard coded end date
	- checks songs against current lyrics files in the data folder
	- saves all missing songs in missing.tsv
	- HAS DUPLICATES
	- to remove duplicates, run the following in terminal
	- sort missing.tsv | uniq > missing-unique.tsv

/songs/:fileName

	- gets all lyrics from a specific billboard json file (saved locally)
	- takes the file location + name as input

/missinglyrics

	- creates a missing.tsv file with information about all songs in billboard data set with missing lyrics


/getmissinglyrics
	
	- requires missing-unique.tsv (the aggregate file of missing lyrics)
	- uses apiseeds api to run through the missing songs for lyrics
	

/lgget
	
	- requires missing-unique-2.tsv (the aggregate file of missing lyrics)
	- uses lyrics-get npm package to get more missing lyrics


/missingunique
	
	- requires missing-unique-2.tsv (the aggregate file of missing lyrics)
	- goes through missing-unique-2.tsv, and if song files don't exist, add it to missing-unique-3.tsv
	- creates missing-unique-3.tsv which is a subset of missing-unique-2.tsv that still doesn't have lyrics


None of the endpoints actually do/return anything, they just spin and save files.

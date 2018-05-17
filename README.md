# lyricalnotes

# project write up
https://docs.google.com/document/d/1QpyhTGKJNkaBwNbFvk8FzATcaUi5xgRW74LpQchLyb8/edit?usp=sharing

# documentation

## /docs

### purpose
Web portion to host our project's data visualization portion

### location
located in /docs folder

### details

/beta

	- our initial visualizations for the beta release are hosted here

/data

	- data for each visualization is hosted here
	
/scripts-alt

	- our "old" scripts folder with scripts for each viz relating to the static index without scrollytelling

/scripts

	- where the javascript files (written by us) for each visualization are hosted
	
/styles

	- where the css files (written by us) for the website are hosted

/vendor

	- where the vendor files are stored, css and javascript libararies we did not write

index.html is our main site
static.html is the static initial site without scrollytelling

## /data
### purpose
where the raw data for our project was stored

### details
<songId>-lyrics.json
	
	- lyrics file for <songId>

<date>.json
	
	- that week's billboard chart data

/missing

	- update to previously missing lyrics files (same naming convention and format)

## /processed-data
### purpose
Where the processed data files (after running through R) for each visualization initially were kept.  We went through several iterations, so these files are the initial ones

## /views
### purpose
to host the views for the node.js app.  Originally Allison was going to use node/express/jade to build the site.  But as we did not need backend processing power, and no one else had worked with jade templating, this idea was abandoned.

## other files in main folder

### missing*.tsv
	
	- files with information on songs with missing lyrics in our dataset
	- We went through several iterations trying to find more lyrics.
	- missing.tsv is the aggregate (with duplicates) from all the billboard files
	- missing-unique*.tsv are the unique remaining songs with no lyrics as went went on
	- the most up to date is missing-unique-3.tsv with 804 entries
	-missingFreq.csv is the frequency of missing songs BEFORE we ran more code to get lyrics

### package.json
	
	- the node.js packages we used in the node.js portion

### VizProj.R

	- the R file we used to clean up and aggregate the data.


## app.js

### purpose
gets song chart data from http://billboard.modulo.site/

and accompanying lyrics data from https://orion.apiseeds.com/ and https://github.com/rhnvrm/lyric-api	

currently it is limited to 1990-2015

### config.js
needs a config file in the main folder that contains the following.  Replace key with your API key from https://orion.apiseeds.com/

```
var config = {
	APISEEDS_KEY: "key"
}

module.exports = config;
```

### getting started

`node app.js`

then access localhost:8080/<your chosen endpoint> in the browser

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

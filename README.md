# lyricalnotes

## config.js
needs a config file that contains the follow.  Replace key with your API key from https://orion.apiseeds.com/

```
var config = {
	APISEEDS_KEY: "key"
}

module.exports = config;
```

## getting started

`node app.js`

## end points
/lyrics/:fileName

	- where fileName is the name of a file with all the data from a certain billboard date
	- this will go through and get the lyrics from the songs on that date's list.
	- each song file is saved as <songid>-lyrics.json

/alldates

	- Will get the full range of the billboard data set from 1958-8-9 to end of 2015
	- The unoffical billboard API only takes Saturdays, so thats factored in
	- Currently values are hard coded, but may be changed to take a dynamic range in the future
	- Each API call is saved as <date>.json


/date?:date

	- where date is the date in the format that the billboard api wants
	- files are saved as <date>.json

None of the endpoints actually do/return anything, they just spin and save files.

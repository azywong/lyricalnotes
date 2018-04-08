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
where fileName is the name of a file with all the data from a certain billboard date
this will go through and get the lyrics from the songs on that date's list.
each song file is saved as <songid>-lyrics.json


/date?:date
where date is the date in the format that the billboard api wants
files are saved as <date>.json

Neither of them actually do/return anything, they just spin and save files.

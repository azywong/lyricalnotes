var config = require('./config');
var express = require('express');
var http = require('http');
var https = require('https');
var fs = require('fs');
var tsv = require('tsv');
var csv = require('csv');
var lg = require("lyric-get");

var app = express();
var port = process.env.PORT || 8080;
var APISEEDS_KEY = process.env.APISEEDS_KEY;

var lgget = function(songName, artistName, filename, song, i) {
	setTimeout(function() {
		console.log(songName + ", " + artistName);
		lg.get(artistName, songName, function(err, res){
		    if(err){
		        console.log(err);
		    }
		    else{
		        var ws = fs.createWriteStream(filename);
		        song.lyrics = res;
				ws.write(JSON.stringify(song));
				ws.end();
				console.log(filename);
		    }
		});
	}, 1000 * i);
}

var waitRequest = function(j, songOptions, song, filename) {
	setTimeout(function() {
		var songResults = "";
		https.request(songOptions, function(response){
			response.setEncoding('utf8');

			response.on('data', function(chunk){
				songResults += chunk;
			});

			response.on('end', function() {
				if(songResults.length > 0){
					console.log(songOptions.path + " http request end");
					if (songResults.substring(0,1) == "{"){
						songResults = JSON.parse(songResults);
						if (songResults.result) {
							var ws = fs.createWriteStream(filename);
							song.lyrics = songResults.result.track.text;
							ws.write(JSON.stringify(song));
							ws.end();
						} else {
							console.log(songOptions.path + " was not found")
						}
					} else {
						console.log(songOptions.path + " errored out")
					}

				}
			});
		}).end();
	}, 5000 * j);
}

var getLyricsFromBillboardFile = function (filename, k) {
	if (fs.existsSync("data/" + filename)) {

		setTimeout(function() {
			fs.readFile("data/" + filename, 'utf8', function(err, data) {
				if (err) {
					console.log(err);
				}
				console.log("GETTING LYRICS FROM " + filename);
				var data = JSON.parse(data);
				var songs = data.songs;

				for (var i = 0; i < songs.length; i++) {
					var songName = encodeURI(songs[i].song_name.replace(/\//g, "").replace(/\(.+\)/g, " "));
					var artistName = encodeURI(songs[i].display_artist.replace(/\//g, ""));
					var songfilename = "data/" + songs[i].song_id + "-lyrics.json";
					var songOptions = {
						host: 'orion.apiseeds.com',
						port: 443,
						path: '/api/music/lyric/' + artistName + "/" + songName + "?apikey=" + config.APISEEDS_KEY,
  						agent: false,
						method: 'GET'
					};
					if(!fs.existsSync(songfilename)) {
						waitRequest(i, songOptions, songs[i], songfilename);
					} else {
						console.log(songfilename + " already exists");
					}
				}
			});
		},200000 * k);
	} else {
		// pull billboard file again
		billboardWaitRequest(filename.replace(".json", ""), 1);
		console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
		console.log(filename + " still needs lyrics");
		console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
	}
}

var billboardWaitRequest = function(date, j) {
	setTimeout(function() {
		var options = {
			host: 'billboard.modulo.site',
			port: 80,
			path: '/charts/' + date,
			method: 'GET'
		};
		var results = "";
		console.log(options);
		var filename = "data/" + date + ".json";
		if(!fs.existsSync(filename)) {
			http.request(options, function(resp){
				resp.setEncoding('utf8');
				var ws = fs.createWriteStream(filename);

				resp.on('data', function(chunk){
					ws.write(chunk);
				});

				resp.on('end', function() {
					ws.end();
				});
			}).end();
		}
	}, 1000 * j);
}

app.set('views', './views');
app.set('view engine', 'jade');

app.get('/alldates', function(req, res) {
	var startDate = new Date();
		startDate.setFullYear(1958);
		startDate.setMonth(7);
		startDate.setDate(17);
	var endDate = new Date();
		endDate.setFullYear(2015);
		endDate.setMonth(11);
		endDate.setDate(26);
	var currentDate = startDate;
	var i = 0;
	while(currentDate.getFullYear() < 2016) {
		console.log(currentDate.toString());
		// check if its a saturday
		var day = currentDate.getDay();
		if (day == 6) {
			//format current date
			var year = currentDate.getFullYear();
			var month = currentDate.getMonth() + 1;
			var date_day = currentDate.getDate();
			var date = year + "-" + month + "-" + date_day;
			//hit endpoint
			billboardWaitRequest(date, i);
			i++;
		}
		// increment date
		var newDate = currentDate.getDate()+1;
		currentDate.setDate(newDate);
	}
});

app.get('/date/:date', function(req, res) {
	var date = req.params.date;
	var options = {
		host: 'billboard.modulo.site',
		port: 80,
		path: '/charts/' + date,
		method: 'GET'
	};
	var results = "";


	http.request(options, function(resp){
		resp.setEncoding('utf8');
		var ws = fs.createWriteStream("data/" + date + ".json");

		resp.on('data', function(chunk){
			ws.write(chunk);
		});

		resp.on('end', function() {
			ws.end();
			res.render('home', {
				data: JSON.stringify(results)
			});
		});
	}).end();
});

app.get('/lyrics/:fileName', function(req, res) {
	fs.readFile("data/" + req.params.fileName, 'utf8', function(err, data) {
		if (err) throw err;
		var data = JSON.parse(data);
		var songs = data.songs;

		for (var i = 0; i < songs.length; i++) {
			var songName = encodeURI(songs[i].song_name.replace(/\(.+\)/, ""));
			var artistName = encodeURI(songs[i].display_artist.replace("/",""));
			var filename = "data/" + songs[i].song_id + "-lyrics.json";
			var songOptions = {
				host: 'orion.apiseeds.com',
				port: 443,
				path: '/api/music/lyric/' + artistName + "/" + songName + "?apikey=" + config.APISEEDS_KEY,
				method: 'GET'
			};
			if(!fs.existsSync(filename)) {
					waitRequest(i, songOptions, songs[i], filename);
			} else {
				console.log(filename + " already exists");
			}
		}
	});
});

app.get('/alllyrics', function(req, res) {

	var startDate = new Date();
		startDate.setFullYear(2015);
		startDate.setMonth(3);
		startDate.setDate(1);
	var currentDate = startDate;
	var i = 0;
	while(currentDate.getFullYear() < 2016) {
		// check if its a saturday
		var day = currentDate.getDay();
		if (day == 6) {
			//format current date
			var year = currentDate.getFullYear();
			var month = currentDate.getMonth() + 1;
			var date_day = currentDate.getDate();
			var date = year + "-" + month + "-" + date_day;
			//hit endpoint
			var filename = date + ".json";
			getLyricsFromBillboardFile(filename, i);
			i++;
		}
		// increment date
		var newDate = currentDate.getDate()+1;
		currentDate.setDate(newDate);
	}
});


app.get('/songs/:fileName', function(req, res) {
	fs.readFile("data/" + req.params.fileName, 'utf8', function(err, data) {
		if (err) throw err;
		var data = JSON.parse(data);
		var songs = data.songs;

		for (var i = 0; i < songs.length; i++) {
			console.log(songs[i].song_name);
		}
	});
});

app.get('/missinglyrics', function(req, res) {

	var startDate = new Date();
		startDate.setFullYear(1990);
		startDate.setMonth(0);
		startDate.setDate(1);
	var currentDate = startDate;
	var i = 0;
	var ws = fs.createWriteStream("missing.tsv", {flags:'a'});
	while(currentDate.getFullYear() < 2016) {
		// check if its a saturday
		var day = currentDate.getDay();
		if (day == 6) {
			//format current date
			var year = currentDate.getFullYear();
			var month = currentDate.getMonth() + 1;
			var date_day = currentDate.getDate();
			var date = year + "-" + month + "-" + date_day;
			//hit endpoint
			var filename = date + ".json";
			var data = fs.readFileSync("data/" + filename, 'utf8');

			console.log("CHECKING LYRICS FROM " + filename);
			var data = JSON.parse(data);
			var songs = data.songs;
			for (var i = 0; i < songs.length; i++) {
				var songfilename = "data/" + songs[i].song_id + "-lyrics.json";
				if(!fs.existsSync(songfilename)) {
					//song doesn't exist.
					ws.write(songs[i].song_id + "\t" + songs[i].song_name + "\t" + songs[i].display_artist + "\t" + songs[i].artist_id + "\t" + songs[i].spotify_id + "\n");
				}
			}

			i++;
		}
		// increment date
		var newDate = currentDate.getDate()+1;
		currentDate.setDate(newDate);
	}
	ws.write("song_id\tsong_name\tdisplay_artist\tartist_id\tspotify_id\n");
	ws.end();
});

app.get('/getmissinglyrics', function(req, res) {
	fs.readFile('missing-unique.tsv', 'utf8', function(err, data) {
		if (err) throw err;
		var data = tsv.parse(data);
		for (var i = 0; i < data.length - 1; i++) {
			var songName = encodeURI(data[i].song_name);
			var artistName = encodeURI(data[i].display_artist);
			var songfilename = "data/" + data[i].id + "-lyrics.json";
			var songOptions = {
				host: 'orion.apiseeds.com',
				port: 443,
				path: '/api/music/lyric/' + artistName + "/" + songName + "?apikey=" + config.APISEEDS_KEY,
					agent: false,
				method: 'GET'
			};
			var songObject = {
				"song_id": data[i].song_id,
				"song_name": data[i].song_name,
				"artist_id": data[i].artist_id,
				"display_artist": data[i].display_artist,
				"spotify_id": data[i].spotify_id
			}
			waitRequest(i, songOptions, songObject, songfilename);
		};

	});
});

app.get('/convertcsv', function(req, res) {
	fs.readFile('docs/beta/data/viz3_v2.csv', 'utf8', function(err, data) {
		var keywords = [];
		var processed_data = []
		data = data.split("\n");
		//get keywords
		for (var i = 1; i < data.length - 1; i++) {
			var line = data[i];
			line = line.split(",");
			if (line.length == 4) {
				var keyword = line[2].replace(/"/g, "")
				if (keywords.indexOf(keyword) == -1) {
					keywords.push(keyword);
				}
			}
		};
		for (var i = 0; i < keywords.length; i++) {
			processed_data[i] = {};
			processed_data[i].id = keywords[i];
			processed_data[i].values = [];
		};

		for (var i = 1; i < data.length; i++) {
			var line = data[i];
			line = line.split(",");
			if (line.length == 4) {
				var year = parseInt(line[1].replace(/"/g, ""));
				var keyword = line[2].replace(/"/g, "");
				var count = parseInt(line[3].replace(/"/g, ""));
				var object = {year: year, count: count}
				for (var j = 0; j < processed_data.length; j++) {
					if (processed_data[j].id == keyword) {
						processed_data[j].values.push(object);
						break;
					}
				};
			}
		};
		var tsv_data = "year\t";
		for (var i = 0; i < processed_data.length; i++) {
			tsv_data += processed_data[i].id + "\t"
		};
		tsv_data += "\n";
		for (var i = 1990; i <= 2015; i++) {
			tsv_data += i + "\t";
			for (var j = 0; j < processed_data.length; j++) {
				for (var k = 0; k < processed_data[j].values.length; k++) {
					if (processed_data[j].values[k].year == i) {
						tsv_data += processed_data[j].values[k].count + "\t"
					}
				};
			};
			tsv_data += "\n";
		};
		fs.writeFile("docs/beta/data/viz3.tsv", tsv_data, function(err) {
		    if (err) {
		        console.log(err);
		    }
		});
	});
});

app.get('/lgget', function(req, res) {
	fs.readFile('missing-unique-2.tsv', 'utf8', function(err, data) {
		if (err) throw err;
		var data = tsv.parse(data);
		for (var i = 0; i < data.length - 1; i++) {
			var songName = String(data[i].song_name);
			songName = songName.replace(/\(.+\)/, "");
			var artistName = String(data[i].display_artist);
			artistName = artistName.replace(/ Featuring .+/,"");
			var songfilename = "data/missing/" + data[i].song_id + "-lyrics.json";
			var songObject = {
				"song_id": data[i].song_id,
				"song_name": data[i].song_name,
				"artist_id": data[i].artist_id,
				"display_artist": data[i].display_artist,
				"spotify_id": data[i].spotify_id
			}
			lgget(songName, artistName, songfilename, songObject, i);
		};

	});
});

app.get('/missingunique', function(req, res) {
	fs.readFile('missing-unique-2.tsv', 'utf8', function(err, data) {
		if (err) throw err;
		var data = tsv.parse(data);
		var ws = fs.createWriteStream("missing-unique-3.tsv");
		for (var i = 0; i < data.length - 1; i++) {
			var songfilename = "data/missing/" + data[i].song_id + "-lyrics.json";
			if(!fs.existsSync(songfilename)) {
				ws.write(data[i].song_id + "\t" + data[i].song_name + "\t" + data[i].display_artist + "\t" + data[i].artist_id + "\t" + data[i].spotify_id + "\n");
			}
		};
		ws.end();

	});
});




app.listen(port);
var config = require('./config');
var express = require('express');
var http = require('http');
var https = require('https');
var fs = require('fs');

var app = express();
var port = process.env.PORT || 8080;
var APISEEDS_KEY = process.env.APISEEDS_KEY;

var waitRequest = function(j, songOptions, song, filename) {
	setTimeout(function() {
		console.log("in callback");
		var songResults = "";
		console.log(songOptions)
		https.request(songOptions, function(response){
			response.setEncoding('utf8');

			response.on('data', function(chunk){
				songResults += chunk;
			});

			response.on('end', function() {
				console.log(filename + " http request end");
				console.log("songResults = " + songResults);
				if(songResults.length > 0){
					songResults = JSON.parse(songResults);
					if (songResults.result) {
						var ws = fs.createWriteStream(filename);
						song.lyrics = songResults.result.track.text;
						ws.write(JSON.stringify(song));
						ws.end();
					} else {
						console.log(songResults)
					}
				}
			});
		}).end();
	}, 10000 * j);
}

app.set('views', './views');
app.set('view engine', 'jade');

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
			var songName = encodeURI(songs[i].song_name.replace("/",""));
			var artistName = encodeURI(songs[i].display_artist.replace("/",""));
			var filename = "data/" + songs[i].song_id + "-lyrics.json";
			var songOptions = {
				host: 'orion.apiseeds.com',
				port: 443,
				path: '/api/music/lyric/' + artistName + "/" + songName + "?apikey=" + config.APISEEDS_KEY,
				method: 'GET'
			};
			waitRequest(i, songOptions, songs[i], filename);
		}
	});
});


app.listen(port);
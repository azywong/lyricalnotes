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
	}, 1000 * j);
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

		http.request(options, function(resp){
			resp.setEncoding('utf8');
			var ws = fs.createWriteStream("data/" + date + ".json");

			resp.on('data', function(chunk){
				ws.write(chunk);
			});

			resp.on('end', function() {
				ws.end();
			});
		}).end();
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
		}
		i++;
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
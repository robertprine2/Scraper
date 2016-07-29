var express = require('express');
var app = express();

var mongojs = require('mongojs');
var databaseUrl = "scrape";
var collections = ["articles", "comments"];

var db = mongojs('scrape', ['articles', 'comments']);

db.on('error', function(err) {
	console.log('Database Error: ', err);
});

//routes

var PORT = process.env.PORT || 3000;

app.listen(PORT, function() {
	console.log('App running on port 3000!');
});
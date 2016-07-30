//requiring needed packages for website
var cheerio = require('cheerio');
var request = require('request');
var bodyParser = require('body-parser');
var express = require('express');
var app = express();


//requiring and setting up mongo database/collections
var mongojs = require('mongojs');
var databaseUrl = "scrape";
var collections = ["articles", "comments"];

// creates a databse in mongo called scrape with two collections: articles and comments
var db = mongojs('scrape', ['articles', 'comments']);

// lets us know if there is an error with the database if it doesn't turn on
db.on('error', function(err) {
	console.log('Database Error: ', err);
});

//allows html to access assets folder
app.use(express.static(process.cwd() + '/assets'));

// BodyParser interprets data sent to the server
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended: true}));
// app.use(bodyParser.text());
// app.use(bodyParser.json({type: 'application/vnd.api+json'}));

//setting up handlebars
var exphbs = require('express-handlebars');
var hbs = require('handlebars');

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// requesting the html of samdavidson.net/blog
request("http://generationmeh.com/", function (error, response, html) {
	// stop working if there is an error
	if (error) throw error;

	// load the html to cheerio
	var $ = cheerio.load(html);
	
	// array where information will be placed
	var result = [];

	// scrapes h1 a tags for titles and urls of articles
	$('h2').find('a').each(function(i, element) {
		
		// grabs the text in the a tag within the h2 tag (title)
		var title = $(this).text();
		// grabs the href attribute of the a tag within the h2 tag (url)
		var link = $(this).attr('href');
		// creats a variable to store the content that is concatinated in the for each below
		var content = "";

		// scrapes and concatinates content p tags from each article adding a space inbetween p tags within an article
		$('div.entry').find('p').each(function(j, element) {
			content += (" " + $(this).text());
			
		}); // end of content scrape

		// pushes title url and content into the result array
		result.push({
			title: title,
			url: link, 
			content: content
		}); // end of push		

	}); // end of title and url scrape

		var k = 0;

		db.articles.find({title: result[k].title}).forEach(function (err, doc) {
			if(err) throw err;
			k++;
			console.log(result[k].title);
			console.log(doc);
			// if the article title is already in the collection don't insert it
			if (doc.title == result[k].title) {
				console.log("This article is already in the database.")
			}
			// else insert the article into the collection
			else {
				db.articles.insert(result[k]);
			}

		}); // end of articles.find title: thisTitle
		
		// for (var k = 1; k < result.length; k++) {

		// thisTitle = result[k].title;
		// console.log(thisTitle);
		// db.articles.find({title: thisTitle}, function (err, docs) {
			
		// 	// if there is no article with thisTitle insert the article into the collection
		// 	if (err || !docs) db.articles.insert(result[k]);
			
		// 	// else the article title is already in the collection don't insert it
		// 	else console.log("This article is already in the database.");			

		// }); // end of articles.find title: thisTitle

	//routes
	app.get('/', function(req, res) {

		res.render('home', {
			layout: 'main', 
			result: result
		});
	});

	app.post('/comment', function(req, res) {

		// post comment to database

		// redirect to homepage?

	}); // end of app.post comment

}); // end of request samdavidson.net

// port for local server to use
var PORT = process.env.PORT || 3000;

// starts the server and lets us know if it is running
app.listen(PORT, function() {
	console.log('App running on port 3000!');
});
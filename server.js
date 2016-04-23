var express = require('express');
var engines = require('consolidate');
var mustache = require('mustache');
var bodyParser = require('body-parser');
var Twitter = require('twitter');
var ig = require('instagram-node').instagram();

var app = express();

app.set('port', (process.env.PORT || 3000));
app.set('views', __dirname + '/public');
app.set('view engine', 'html');
app.engine('html', engines.mustache);
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

//Twitter API Setup
var client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

//Instagram API Setup
ig.use({ access_token: process.env.INSTAGRAM_ACCESS_TOKEN });

function getTwitterData(query) {
  client.get('search/tweets', {q: query}, function(error, tweets, response){
     console.log(tweets);
  });
}

function getInstagramData(query) {
  console.log("Attempting to call instagram")
  ig.tag_media_recent(query, function(err, medias, pagination, remaining, limit) {
    console.log(medias)
  });
}
// This will be the central function for hitting
// each of the different platform APIs and compiling
// the data into a coherent response to send back to
// the front-end.
function compileData(query) {
  // getTwitterData(query)
  console.log('compiling data')
  getInstagramData(query)
}


app.get('/', function(req, res) {
  console.log("Got main endpoint");
  compileData("aera16");
	res.render('home.html');
});

app.get('/create', function(req, res) {
  // This is the endpoint an AJAX call will hit to
  // get data.
  //compileData("aera16");
});

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found!');
    err.status = 404;
    next(err);
});

app.listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});

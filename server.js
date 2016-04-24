var express = require('express');
var engines = require('consolidate');
var mustache = require('mustache');
var bodyParser = require('body-parser');
var Twitter = require('twitter');
var ig = require('instagram-node').instagram();
var moment = require('moment');

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

//This function gathers and process media from Twitter
function getTwitterData(query) {
  client.get('search/tweets', {q: query}, function(error, tweets, response){
     console.log(tweets[0]);
  });
}

//This function gathers and process media from Instagram
function getInstagramData(query, callback) {
  ig.tag_media_recent(query, function(err, medias, pagination, remaining, limit) {
    
    //Store an array of TL event for each media returned by IG
    mediaObjects = []

    for (var i = 0; i < medias.length; i++) {
      media = medias[i];
      instagramDate = moment(new Date(media.created_time * 1000));

      //Create a TL event for each media
      mediaObject = {
        "media": {
            "url": media.images.standard_resolution.url,
            "caption": media.internalTag,
            "credit": "@" + media.user.username,
            "thumb": media.images.standard_resolution.url
          },
          "start_date": {
            "month": instagramDate.format("MM"),
            "day": instagramDate.format("DD"),
            "year": instagramDate.format("YYYY"),
            "hour": instagramDate.format("HH"),
            "minute": instagramDate.format("mm"),
            "second": instagramDate.format("ss")
          },
          "text": {
            "headline": "",
            "text": "<p>" + media.caption.text + "</p>"
          }
      }

      mediaObjects.push(mediaObject);
    }

    callback(mediaObjects)
  });
}

// This will be the central function for hitting
// each of the different platform APIs and compiling
// the data into a coherent response to send back to
// the front-end.
function compileData(query, callback) {
  // getTwitterData(query)
  getInstagramData(query, function(igMedia) {
    finalJSON = {
      "events": igMedia
    }
    callback(finalJSON)
  });
}

app.get('/', function(req, res) {
	res.render('home.html');
});

app.get('/test', function(req, res) {
  res.render('timeline-test.html');
});

app.get('/create', function(req, res) {
  // This is the endpoint an AJAX call will hit to get data.
  var query = req.query.query;
  compileData(query, function(resultsJSON) {
    res.send(resultsJSON)
  });
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

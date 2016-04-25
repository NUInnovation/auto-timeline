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
  return new Promise(function(resolve, reject) {
    client.get('search/tweets', {q: query}, function(error, tweets, response){
      //Store an array of TL event for each media returned by IG
      tweetObjects = [];

      for (var i = 0; i < tweets.statuses.length; i++) {
        var tweet = tweets.statuses[i];
        var tweetDate = moment(new Date(tweet.created_at));

        //Create a TL event for each media
        var tweetObject = {
          "media": {
              "url": "https://twitter.com/" + tweet.user.screen_name + "/status/" + tweet.id_str,
              "credit": "@" + tweet.user.screen_name
            },
            "start_date": {
              "month": tweetDate.format("MM"),
              "day": tweetDate.format("DD"),
              "year": tweetDate.format("YYYY"),
              "hour": tweetDate.format("HH"),
              "minute": tweetDate.format("mm"),
              "second": tweetDate.format("ss")
            },
            "text": {
              "headline": "",
              "text": "<p>" + tweet.text + "</p>"
            }
        }
        tweetObjects.push(tweetObject);
      }

      resolve(tweetObjects)
    });
  });
}

//This function gathers and process media from Instagram
function getInstagramData(query) {
  return new Promise(function(resolve, reject) {
    ig.tag_media_recent(query, function(err, medias, pagination, remaining, limit) {

      //Store an array of TL event for each media returned by IG
      var mediaObjects = []

      for (var i = 0; i < medias.length; i++) {
        var media = medias[i];
        var instagramDate = moment(new Date(media.created_time * 1000));

        //Create a TL event for each media
        var mediaObject = {
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

      resolve(mediaObjects)
    });
  });
}

// This will be the central function for hitting
// each of the different platform APIs and compiling
// the data into a coherent response to send back to
// the front-end.
function compileData(query, callback) {
  var promises = [getTwitterData(query), getInstagramData(query)]
  Promise.all(promises).then(function() {
    fullResults = arguments[0][0].concat(arguments[0][1])
    finalJSON = {
      "events": fullResults
    }
    callback(finalJSON)
  }, function(err) {
    // error occurred
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

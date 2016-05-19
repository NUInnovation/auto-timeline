var express = require('express');
var engines = require('consolidate');
var mustache = require('mustache');
var bodyParser = require('body-parser');
var Twitter = require('twitter');
var ig = require('instagram-node').instagram();
var moment = require('moment');
var Heap = require('heap');
var HashTable = require('hashtable');

//Mongoose DB Requirements
var mongoose = require('mongoose');
mongoose.connect('mongodb://root:root@ds025752.mlab.com:25752/autotimeline');


var twitterFilter = require("./twitterFilter.js");
var instaFilter = require("./instaFilter.js");

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


//Database Setup
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId

var timelineSchema = new Schema({
    query: String,
    created: Date,
    media: {
      url: String,
      credit: String,
    },
    start_date: {
      month: String,
      day: String,
      year: String,
      hour: String,
      minute: String,
      second: String
    },
    text: {
      headline: String,
      text: String
    }
});

var Timeline = mongoose.model('Timeline', timelineSchema);

//Twitter API Setup
var client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

//Instagram API Setup
ig.use({ access_token: process.env.INSTAGRAM_ACCESS_TOKEN });

function structureAndFilterTweets(tweets, filterFlag) {
    tweetObjects = []
    for (var i = 0; i < tweets.length; i++) {
      var tweet = tweets[i];
      
      if (filterFlag) {
        if(!tweet.favorited) {
          continue;
        }
      }
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

    if (filterFlag) {
      console.log("Tweets Into Filter: " + tweets.length + ". Tweets Out of Filter: " + tweetObjects.length)
    }
    return(tweetObjects)
  }

//This function gathers and process media from Twitter
function getTwitterData(query) {
  return new Promise(function(resolve, reject) {
    client.get('search/tweets', {q: query, count: 100, result_type: "popular", lang:"en"}, function(error, popularTweets, response){
      //Store an array of TL event for each media returned by IG
      if(error) {
        console.log(error)  
      }

      var filterFlag = false;

      if(popularTweets.statuses.length < 10) {
        console.log("No 'popular' tweets returned by query: " + query)
        twitterPage(query, "?q=%23" + query + "%20-RT&count=100", 0, [], function(allTweets) {
          console.log("Total Tweets: " + allTweets.length);
          var finalList = twitterFilter.primaryFilter(allTweets);
          filterFlag = false;
          resolve(structureAndFilterTweets(finalList, filterFlag));
        });
      } 
      else {
        console.log("There were " + popularTweets.statuses.length + " 'popular' tweets returned by query: " + query)
        resolve(structureAndFilterTweets(popularTweets.statuses, filterFlag))
      }
    });
  });

}

//This function can be used to paginate through Twitter API results
function twitterPage(query, page, callCount, storedTweets, callback) {
  var stackCount = callCount + 1;
  client.get('search/tweets.json' + page, {}, function(error, tweets, response){
    //Stored Tweets from call in array
    var callCumulativeTweets = storedTweets.concat(tweets.statuses);

    //Get the next page
    if('next_results' in tweets.search_metadata) {
          var nextPage = tweets.search_metadata.next_results;
    }
    else {
      callback(callCumulativeTweets)
      return;
    }
    console.log("Page Call Count: " + stackCount + ". Next Page: " + nextPage);

    if ((callCount < 10) && typeof(nextPage) != 'undefined') {
      twitterPage(query, nextPage, stackCount, callCumulativeTweets, callback)
    }
    else {
      callback(callCumulativeTweets)
    }
  });
}


function structureInstagramMedia(medias) {
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
  console.log("Media Objects: " + mediaObjects.length)
  return mediaObjects;
}

//This function gathers and process media from Instagram
function getInstagramData(query) {
  return new Promise(function(resolve, reject) {
    var allMedia = []

    //Set a variable to represent a week ago
    var aboutAWeekAgo = moment().subtract(7, 'days');

    var instagramPage = function(err, result, pagination, remaining, limit) {

      if(result.length != 0) {
        //Only add media to the list if it is within the last week
        if (aboutAWeekAgo.isBefore(moment(result[0].created_time *1000))) {
          // console.log("Media is within a week old")
          // console.log(moment(result[0].created_time *1000).calendar())
          allMedia = allMedia.concat(result)
          if(pagination.next) {        
            pagination.next(instagramPage); // Will get second page results
          }
        }
        else {
          console.log("Media is too old")
          
          //Filter the array one last time to ensure that the media
          //is within the last week
          if(allMedia.length > 0) {
            var weekMedia = allMedia.filter(function(media) {
              return aboutAWeekAgo.isBefore(moment(media.created_time *1000));
            });

            //Run the media through the filter
            var filteredMedia = instaFilter.primaryFilter(weekMedia);

            resolve(structureInstagramMedia(filteredMedia))
          }
          else {
            console.log("No media is considered, so we need to resolve with no data.")
            console.log("All Media: " + allMedia.length)
            resolve(allMedia)
          }
        }

      };
    }

    //Call paginating API call
    ig.tag_media_recent(query, instagramPage);

  });

}

function save(date, query, resultsJSON) {
  for (var i = 0; i < resultsJSON.length; i++) {
    var item = resultsJSON[i];

    var t = new Timeline({ 
      query: query,
      created: date,
      media: {
        url: item.media.url,
        credit: item.media.credit,
      },
      start_date: {
        month: item.start_date.month,
        day: item.start_date.day,
        year: item.start_date.year,
        hour: item.start_date.hour,
        minute: item.start_date.minute,
        second: item.start_date.second
      },
      text: {
        headline: item.text.headline,
        text: item.text.text
      } 
    });

    t.save(function(err) {
      if (err) throw err;
      console.log('Timeline saved successfully!');
    });
  }
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
    save(new Date(), query, resultsJSON);
    res.send(resultsJSON);
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

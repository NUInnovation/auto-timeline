var moment = require('moment');
require('moment-range');

var Heap = require('heap');
var HashTable = require('hashtable');


function primaryFilter(tweets) {

	//Find the correct date range
	var dateFilteredTweets = dateFilter(tweets);

	//Find counts of tweets per day
	var tweetsBySect = {};
	for (var i = 0; i < dateFilteredTweets.length; i++) {
		var tweetSect = moment(new Date(dateFilteredTweets[i].created_at)).format("MM/DD/YYYY");
		if(tweetSect in tweetsBySect) {
			tweetsBySect[tweetSect].push(dateFilteredTweets[i]);
		}
		else {
			tweetsBySect[tweetSect] = [dateFilteredTweets[i]];
		}
	}

	//Run tweets for each time sect through evaluator
	var finalList = []
	var tweetsPerSect = 5
	for (var sect in tweetsBySect){
		//Select the tweets within the sect
		var sectTweets = tweetsBySect[sect];

		// Setup a hastable and list for heap
		var hashtable = new HashTable();
		var scoresList = []

		for (var i = 0; i < sectTweets.length; i++) {
			var tweet = sectTweets[i];
			var score = evaluate(tweet);
			scoresList.push(score);
			hashtable.put(score, tweet);
		}
		//Get the largest few scores in the scoresList
		var largeScores = Heap.nlargest(unique(scoresList), tweetsPerSect);
		//Push those tweets into the final list
		for (var i=0; i < tweetsPerSect; i++){
			if (largeScores[i]) {
				finalList.push(hashtable.get(largeScores[i]))
			}
		    
		}
	}

	return finalList;	
}

function unique(xs) {
  return xs.filter(function(x, i) {
    return xs.indexOf(x) === i
  })
}

//Function for taking the tweets that are produced
//during the likely time perid of the event.
function dateFilter(tweets) {
	//Sort the tweets by created time
	var sortedTweets = tweets.sort(function(a, b) {
		var aTime = new Date(a.created_at);
		var bTime = new Date(b.created_at);
		return aTime - bTime;
	});

	//Find counts of tweets per day
	var daysDict = {};
	for (var i = 0; i < sortedTweets.length; i++) {
		var tweetTime = moment(new Date(sortedTweets[i].created_at)).format("MM/DD/YYYY");
		if(tweetTime in daysDict) {
			daysDict[tweetTime] += 1;
		}
		else {
			daysDict[tweetTime] = 1;
		}
	}
	console.log(daysDict)

	//Find max count value
	var maxCount = daysDict[Object.keys(daysDict).reduce(function(a, b){ return daysDict[a] > daysDict[b] ? a : b })];

	console.log("Max Count: " + maxCount);

	//Iterate through list to find the start and stop times
	var startDateKey = null;
	var endDateKey = null;
	var prevKey = null;
	for (var key in daysDict){

		var currCount = daysDict[key];

		if(startDateKey == null) {
			if(currCount >= 0.5*maxCount) {
				startDateKey = key;
			}
		}
		else {
			if(currCount < 0.5*maxCount) {
				endDateKey = key;
			}
		}
		
		prevKey = key
	}

	if(endDateKey == null) {
		endDateKey = prevKey;
	}

	console.log("Start Date: " + startDateKey);
	console.log("End Date: " + endDateKey);

	//Take the corresponding subset of the list
	var consideredRange = moment().range(new Date(startDateKey), new Date(endDateKey));
	var filteredTweets = sortedTweets.filter(function(tweet) {
		return consideredRange.contains(moment(new Date(tweet.created_at)), false);
	});

	return filteredTweets;

}

//Function for evaluating tweets
function evaluate(tweet){
	var weight = 0;
	weight += tweet.retweet_count;
	weight += tweet.user.followers_count*0.05;
	weight += tweet.user.friends_count*0.05

	if ( tweet.favorited == true ){
		weight += 1;
	} else if (tweet.user.lang == "en"){
		weight += 1;
	} else if (tweet.user.verified == true ){
		weight += 1;
	}
	return weight;
}

module.exports = {
	primaryFilter: primaryFilter
}
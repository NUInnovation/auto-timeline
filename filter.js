var moment = require('moment');

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
		// console.log(moment(new Date(sortedTweets[i].created_at)).calendar())
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
	

}

module.exports = {
	dateFilter: dateFilter
}
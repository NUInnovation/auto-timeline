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

}

module.exports = {
	dateFilter: dateFilter
}
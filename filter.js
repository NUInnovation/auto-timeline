var moment = require('moment');

function dateFilter(tweets) {
	//Sort the tweets by created time
	var sortedTweets = tweets.sort(function(a, b) {
		var aTime = a.created_time;
		var bTime = b.created_time;
		return bTime - aTime
	});

	console.log("\n###### SHOWING SORTED TWEETS ######\n");
	for (var i = 0; i < sortedTweets.length; i++) {
		console.log(moment(new Date(sortedTweets[i].created_at)).calendar())
	}

}

module.exports = {
	dateFilter: dateFilter
}
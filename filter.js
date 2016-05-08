var moment = require('moment');

function dateFilter(tweets) {
	//Sort the tweets by created time
	var sortedTweets = tweets.sort(function(a, b) {
		var aTime = new Date(a.created_at);
		var bTime = new Date(b.created_at);
		return aTime - bTime;
	});

}

module.exports = {
	dateFilter: dateFilter
}
var moment = require('moment');
require('moment-range');

function primaryFilter(medias) {
	//Do a date range filtering on the content
	var dateFilteredMedia = dateFilter(medias)
	console.log("Date Filtered Length: " + dateFilteredMedia.length);

	return dateFilteredMedia;

	//Apply evaluations to the content
}

//Function for taking the tweets that are produced
//during the likely time perid of the event.
function dateFilter(medias) {
	//Sort the medias by created time
	var sortedMedia = medias.sort(function(a, b) {
		var aTime = new Date(a.created_time*1000);
		var bTime = new Date(b.created_time*1000);
		return aTime - bTime;
	});

	//Find counts of tweets per day
	var daysDict = {};
	for (var i = 0; i < sortedMedia.length; i++) {
		var mediaTime = moment(new Date(sortedMedia[i].created_time*1000)).format("MM/DD/YYYY");
		if(mediaTime in daysDict) {
			daysDict[mediaTime] += 1;
		}
		else {
			daysDict[mediaTime] = 1;
		}
	}

	console.log("Media Dictionary:");
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
			if(currCount >= 0.3*maxCount) {
				startDateKey = key;
			}
		}
		else {
			if(currCount < 0.3*maxCount) {
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
	var filteredMedia = sortedMedia.filter(function(media) {
		return consideredRange.contains(moment(new Date(media.created_time*1000)), false);
	});

	return filteredMedia;

}


module.exports = {
	primaryFilter: primaryFilter
}
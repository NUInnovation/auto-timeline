var moment = require('moment');
require('moment-range');

var Heap = require('heap');
var HashTable = require('hashtable');

var LanguageDetect = require('languagedetect');
var lngDetector = new LanguageDetect();

function primaryFilter(medias) {
	//Do a date range filtering on the content
	var dateFilteredMedia = dateFilter(medias)
	console.log("Date Filtered Media Length: " + dateFilteredMedia.length);
	var daysCount = 0;

	//Find counts of tweets per day
	var mediaBySect = {};
	for (var i = 0; i < dateFilteredMedia.length; i++) {
		var mediaSect = moment(new Date(dateFilteredMedia[i].created_time*1000)).format("MM/DD/YYYY");
		if(mediaSect in mediaBySect) {
			mediaBySect[mediaSect].push(dateFilteredMedia[i]);
		}
		else {
			mediaBySect[mediaSect] = [dateFilteredMedia[i]];
		}
	}

	for (var sect in mediaBySect){
		daysCount++;
	}

	//Run tweets for each time sect through evaluator
	console.log("We are considering " + daysCount + " days.");
	var finalList = []
	var mediaPerSect = 5;
	if(daysCount < 3) {
		mediaPerSect = 10;
	}

	for (var sect in mediaBySect){
		//Select the tweets within the sect
		var sectMedia = mediaBySect[sect];
		// console.log(sectMedia[0])

		// Setup a hastable and list for heap
		var hashtable = new HashTable();
		var scoresList = []

		for (var i = 0; i < sectMedia.length; i++) {
			var media = sectMedia[i];
			var score = evaluate(media);
			scoresList.push(score);
			hashtable.put(score, media);
		}
		//Get the largest few scores in the scoresList
		var largeScores = Heap.nlargest(unique(scoresList), mediaPerSect);
		//Push those tweets into the final list
		for (var i=0; i < mediaPerSect; i++){
		    if (largeScores[i]) {
				finalList.push(hashtable.get(largeScores[i]))
			}
		}
	}
	console.log(finalList.length)
	return finalList;	
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
	if(startDateKey == endDateKey) {
		var filteredMedia = sortedMedia.filter(function(media) {
			return moment(new Date(media.created_time*1000)).format("MM/DD/YYYY") == startDateKey
		});
	}
	else {
		var consideredRange = moment().range(new Date(startDateKey), new Date(endDateKey));
		var filteredMedia = sortedMedia.filter(function(media) {
			return consideredRange.contains(moment(new Date(media.created_time*1000)), false);
		});
	}

	return filteredMedia;

}

//Uniquify a list
function unique(xs) {
  return xs.filter(function(x, i) {
    return xs.indexOf(x) === i
  })
}

//This function adds a point value (weight) to 
//each piece of instagram media
function evaluate(insta){
	var weight = 0;

	var instaText = insta.caption.text;
	if(instaText != '' && instaText != null) {
		var likelyLangs = lngDetector.detect(instaText);
		if(likelyLangs && likelyLangs.length > 0) {
			if(likelyLangs[0][0]) {
				if (likelyLangs[0][0] == "english") {
					weight += insta.likes.count;
					weight += insta.comments.count;
					weight += insta.likes.count;
					weight += insta.comments.count;
				}
			}
		}
	}
	else {
		weight += insta.likes.count;
		weight += insta.comments.count;
		weight += insta.likes.count;
		weight += insta.comments.count;
	}
	
	return weight;

}


module.exports = {
	primaryFilter: primaryFilter
}

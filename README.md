# Auto-Timeline

###Team Members
The Auto-Timeline project is currently being developed by Jingming Guo, Andy Linder, Bomani McClendon, and Weikang Zhang for the Spring 2016 EECS 395/JOUR 340: Collaborative Innovation in Journalism & Technology course.

###What it does
We seek to create a product that will aggregate social media content in a TimelineJS format based on a user’s query. Current social media aggregators are indeed able to organize content based on hashtags and timestamps, but don’t afford the ability to complete higher level selection and organization of social media content.

With Auto-Timeline, after a user inputs his/her desired hashtag, our platform returns a beautiful timeline with the most newsworthy posts associated with that hashtag. We filter  by automatically detecting the date range most relevant to the user’s search, as well as by assessing the popularity of posts -- specifically, those which Twitter and Instagram have deemed most popular, those from verified accounts, and also those with the most retweets/likes.

As a result, the user saves time in their search for the most newsworthy posts associated with an event and/or a general news story that he/she has selected.

###How it works

For the front-end of our application, we used Materialize UI framework to style the components. Using jQuery, the front-end sends a GET request to our back-end server. The server responds with a JSON representation of the data for the timeline. This data is then used to instantiate the Timeline and append it to the DOM. An example of instantiating a Timeline in this way can be found in the open-source examples from TimelineJS3’s Github repository.

The primary selection and filtering processes happen on our back-end server, which was built using Node.js and Express. Once a GET request is issued to the /create endpoint by the front-end, the server parses the request for the query information, and issues queries to the Instagram and Twitter APIs using the twitter and instragram-node npm modules. 
Twitter allows the opportunity for us to send more specific queries to their API. Specifically, we sent a query that specifically looked for posts that contained the hashtag we were looking for. We also can use set the result_type parameter to ‘popular’ in order to see what tweets Twitter deems as trending or relevant. In many cases, the events that people in our user class might search for are too new or too small to have any results when this parameter is set. In these cases, our server automatically paginates through API results in order to collect all of the tweets from the last 7 days (the furthest back that the API goes). Instagram on the other hand can go back from a longer period of time, but we stop the pagination process after it reaches 7 days.

Once the content is retrieved, it is filtered on our server. There are two sequential steps in the filtration process: date filtering, and evaluation. The date filtering step bins the content by day, and removes the leading and trailing days that have a small amount of content in comparison to the day within the range that has the highest amount of posts. This method allows us to automatically find the relevant data range for the event without the user needing to enter it in. the evaluation step first removes all content that isn’t in English, and then adds weight to each piece of content if it has lots of engagements on social media, or was posted by verified or popular user. Once all of the content is ranked, we select the top pieces of content for each day in the range and structure them in preparation to be displayed in the timeline. 
Each timeline that is created is also saved in a MongoDB database that is host on mLab. We use an npm module called Mongoose to create a schema for each object. The timelines can be referenced by a unique ID, which is handled by and Express route that locates the Timeline content based on a slug that is passed through a URL of this format: autotimeline.herokuapp.com/timeline/<timeline-id>.

Using this process, we are able to select relevant tweets and Instagram posts to create and store personalized, valuable timelines.

###Key Technologies
We used Node.js, Express to build our server, and use wrapper for the [twitter](https://www.npmjs.com/package/twitter) and [instagram-node](https://www.npmjs.com/package/instagram-node) API wrappers from npm to gather content. In addition, we interface with a MongoDB database hosted on mLab using [Mongoose](https://www.npmjs.com/package/mongoose). On the front-end, we use the [Materialize CSS](http://materializecss.com/) project for styling, and Javascript and jQuery to handle sending requests to our server.

###Setup
In order to run this code, you will need to store your API credentials for Instagram and Twitter as environment variables. One easy way to do this is to set them with a bash script like so:

```
export TWITTER_CONSUMER_KEY= [insert key]
export TWITTER_CONSUMER_SECRET=[insert key]
export TWITTER_ACCESS_TOKEN_KEY=[insert key]
export TWITTER_ACCESS_TOKEN_SECRET=[insert key]
export INSTAGRAM_ACCESS_TOKEN=[insert key]
```

Afterwards, ensure that Node.js installed on your computer. Lastly, you can run `node server.js` to start the server.

Note: The Instagram API changed on June 1, so the acquirement of an Instagram API access token is different. This changed has caused our utlilization of the Instagram API to cause error.

###Next Steps
If we had more time, we would continue to refine our Auto-Timeline platform to improve user experience and our filtering performance. Specifically, for popular hashtags, the pagination process can take a while and slow down results, especially on Instagram. We would also look into allowing users of Auto-Timeline to create “accounts” so they can easily access previously searched timelines, or give them a way to easily implement timelines on their websites. We feel those would be the next logical steps in improving our project, now that the back-end is well-built and ready for implementation.
# Auto-Timeline

###Team Members
The Auto-Timeline project is currently being developed by Jingming Guo, Andy Linder, Bomani McClendon, and Weikang Zhang for the Spring 2016 EECS 395/JOUR 340: Collaborative Innovation in Journalism & Technology course.

###What it does
We seek to create a product that will aggregate social media content in a TimelineJS format based on a user’s query. Current social media aggregators are indeed able to organize content based on hashtags and timestamps, but don’t afford the ability to complete higher level selection and organization of social media content.

With Auto-Timeline, after a user inputs his/her desired hashtag, our platform returns a beautiful timeline with the most newsworthy posts associated with that hashtag. We filter  by automatically detecting the date range most relevant to the user’s search, as well as by assessing the popularity of posts -- specifically, those which Twitter and Instagram have deemed most popular, those from verified accounts, and also those with the most retweets/likes.

As a result, the user saves time in their search for the most newsworthy posts associated with an event and/or a general news story that he/she has selected.

###How it works
Our product will feature several novel capabilities:
Smart selection of content based on: engagements/influence of posts within a certain topic domain, filtering on location, ability to select a timeframe for the Auto-Timeline, certain types of social media users (news organizations, verified social media users, general user population, etc.)

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
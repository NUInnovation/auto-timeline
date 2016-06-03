# Auto-Timeline

###Team Members
The Auto-Timeline project is currently being developed by Jingming Guo, Andy Linder, Bomani McClendon, and Weikang Zhang for the Spring 2016 EECS 395/JOUR 340: Collaborative Innovation in Journalism & Technology course.

###What it does
We seek to create a product that will aggregate social media content in a TimelineJS format based on a user’s query. Current social media aggregators are indeed able to organize content based on hashtags and timestamps, but don’t afford the ability to complete higher level selection and organization of social media content.

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

Note: The Instagram API changed on June 1, so the acquirement of an Instagram API access token is different.

###Next Steps
We are currently working on determining how we should evaluate which content should be placed into an automatically generated Timeline.
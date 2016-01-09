# SOmusic | music from social network
[![Build Status](https://travis-ci.org/l2fprod/somusic-webui.svg?branch=master)](https://travis-ci.org/l2fprod/somusic-webui)

> People are sharing what they are listening to on social networks.
>
> SOmusic gathers this information and produces rankings.
>
> It's your daily dose of what's popular on social networks.

Back in 2000s after Apple came out with the iPod, we started to have a lot of music in the palm of our hand, ripped from our CDs, bought from online MP3/AAC stores—or don’t lie to ourselves, downloaded from the Internet. With mobile devices and the low cost of storage like SD cards, our smartphones replaced iPod-like devices. During this (r)evolution, music consumption changed too. Companies like Spotify, Deezer, Beats Music, and TIDAL now offer, for a price, a large music streaming catalog. An infinitely larger number of tracks than you could fit in the largest iPod available today.

Social networking is another trend that has changed how we consume information. You find an interesting video/image/article/meme, you share it on Twitter with some hashtags, your followers notice, retweet, favorite, others find this content too and that’s it, the topic is trending, the site with the article goes down—it got slashdotted as they said in the past.

Back to music; there was a time when you would tell your friends face-to-face or over the phone or by email about this new band you heard on the radio. Today, you can still do that of course, but in addition and instead of sharing this with your immediate circles, you can share on your social network—and if you were actually listening to the song on your streaming you can usually just share a link to this song to Twitter, Facebook and others. This is where SOmusic comes in, with a mission: Scan social networks and tell me what people are listening to. If it is popular it might be good—or not.

## Architecture

SOmusic is made of several micro-services working together to collect, identify, count and display songs.

![Architecture](http://g.gravizo.com/g?
  digraph G {
    node [fontname = "helvetica"]
    /* polls twitter */
    collect -> twitter
    /* stores in database */
    collect -> songsdb
    /* find tweets to identify */
    identify -> songsdb
    /* uses spotify */
    identify -> spotify
    /* counts tweets */
    stats -> songsdb
    /* updates statistics */
    stats -> statsdb
    /* displays stats */
    webui -> statsdb
    /* */
    {rank=source; twitter, spotify }
    {rank=same; collect -> identify -> stats -> webui[style=invis] }
    {rank=sink; songsdb, statsdb }
    /* styling */
    twitter [shape=circle style=filled color="%234E96DB" fontcolor=white]
    spotify [shape=circle style=filled color="%2324B643" fontcolor=white]
    songsdb [shape=box]
    statsdb [shape=box]
  }
)

Components collect/identify/stats are triggered every once in a while and do not know about each other.

### Spring Boot apps

* [somusic-collect](https://github.com/l2fprod/somusic-collect) queries the IBM Insights for Twitter service, looking for references to music links. It stores the resulting tweets into a IBM Cloudant database. In its current implementation, SOmusic searches for Spotify links – yes, I’m a premium subscriber to Spotify.

* [somusic-identify](https://github.com/l2fprod/somusic-identify) processes this database and resolves music links into song title, artist name, album title and album cover. It uses the Spotify Web API.

* [somusic-stats](https://github.com/l2fprod/somusic-stats) aggregates data by day in its own database.

### Node.js app
* [somusic-webui](https://github.com/l2fprod/somusic-webui) makes the aggregated data available to web clients. With no surprise, the front-end used Bootstrap, jQuery and a few plugins (Masonry, handlebars, Moment.js, jQuery Hotkeys). Masonry is responsible for the Pinterest-like layout and resize flow. Bootstrap makes the UI responsive to window size changes and smaller devices.

## Running the app in Bluemix

If you want to have your own version of SOmusic, use the deploy buttons below:

1. [![Deploy to Bluemix](https://bluemix.net/deploy/button.png)](https://bluemix.net/deploy?repository=https://github.com/l2fprod/somusic-collect) the somusic-collect service
1. then [![Deploy to Bluemix](https://bluemix.net/deploy/button.png)](https://bluemix.net/deploy?repository=https://github.com/l2fprod/somusic-identify) the somusic-identify service
1. then [![Deploy to Bluemix](https://bluemix.net/deploy/button.png)](https://bluemix.net/deploy?repository=https://github.com/l2fprod/somusic-stats) the somusic-stats service
1. and finally [![Deploy to Bluemix](https://bluemix.net/deploy/button.png)](https://bluemix.net/deploy?repository=https://github.com/l2fprod/somusic-webui) the somusic-webui app

## Links
- https://somusic.mybluemix.net
- https://developer.ibm.com/bluemix/2015/05/08/somusic-and-bluemix/
- https://developer.ibm.com/bluemix/2015/07/27/somusic-and-twitter/

## Built with

- IBM Bluemix
- IBM Insights for Twitter
- IBM Cloudant
- Spring Boot
- NodeJS
- Spotify Web API
- Bootstrap
- JQuery
- Masonry
- Handlebars
- Momentjs
- jquery.hotkeys.js by John Resig, Dual licensed under the MIT or GPL Version 2 licenses

## License

SOmusic is licensed under the Apache License Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0).
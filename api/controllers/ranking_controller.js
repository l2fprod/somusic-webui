'use strict';

var moment = require('moment');
var Database = require('../helpers/database.js');

/*
 functions listed in the swagger file
 */
module.exports = {
  ranking: ranking
};

//  /ranking:
//  /ranking/{date}:
function ranking(req, res) {
  var date;
  if (req.swagger.params.date && req.swagger.params.date.value) {
    date = moment(req.swagger.params.date.value, "YYYY-MM-DD");
  } else {
    date = moment.utc();
  }
  date.seconds(0).hours(0).minutes(0).milliseconds(0);
  console.log("Looking for " + date.format());

  var db = Database.instance();
  db.view("stats", "by_date", {
    //limit: 150,
    key: date.format("YYYY-MM-DDTHH:mm:SS.000+0000"),
    include_docs: true
  }, function (err, body) {
    if (!err) {
      var result = {};
      result.current = date.format("YYYY-MM-DD");
      result.prev = moment(date).subtract(1, 'days').format("YYYY-MM-DD");
      result.next = moment(date).add(1, 'days').format("YYYY-MM-DD");
      result.entries = [];
      body.rows.forEach(function (doc) {
        // cleanup output by removing some internal fields we don't want in the API
        delete doc.doc._id;
        delete doc.doc._rev;
        delete doc.doc.sourceId;
        delete doc.doc.state;
        delete doc.doc.createdAt;
        result.entries.push(doc.doc);
      });

      // first sort entries on the artist
      result.entries.sort(function (song1, song2) {
        return song2.artist.toLocaleLowerCase().localeCompare(song1.artist.toLocaleLowerCase());
      });

      // group items with the same name
      var currentIndex = 0;
      var currentEntry, lastEntry;
      do {
        currentEntry = result.entries[currentIndex];
        if (lastEntry == null) {
          // we are just starting!
          lastEntry = currentEntry;        
          currentIndex++;
        } else {
          if (lastEntry.artist == currentEntry.artist) {
            // just found a copy cat, delete it!
            result.entries.splice(currentIndex, 1);
            // capture its count
            lastEntry.count += currentEntry.count;
            // and move it as child
            if (!lastEntry.children) {
              lastEntry.children = [];
            }
            lastEntry.children.push(currentEntry);
            // don't move the current index, we will look at it again at the next iteration
          } else {
            // it is a different artist, use it as our new reference and move on!
            lastEntry = currentEntry;
            currentIndex++;
          }
        }
      } while (currentIndex < result.entries.length);
      
      // resort with the updated count
      result.entries.sort(function (song1, song2) {
        return song2.count - song1.count;
      });
           
      // keep only the first 50 entries
      result.entries = result.entries.slice(0, 50);
      
      res.json(result);
    } else {
      console.error(err);
      res.send(500);
    }
  });
}

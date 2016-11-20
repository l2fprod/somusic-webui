'use strict';

var moment = require('moment');
var Database = require('./database.js');

var express = require('express');
var router = express.Router();

function getRanking(res, startDate, endDate) {
  ranking(startDate, endDate || startDate, function(err, ranking) {
    if (err) {
      console.log(err);
      res.status(500).send("{}");
    } else {
      res.send(ranking);
    }
  });
}
router.get('/', function(req, res) {
  getRanking(res, moment.utc());
});

router.get('/:startDate', function(req, res) {
  getRanking(res, moment(req.params.startDate, "YYYY-MM-DD"));
});

router.get('/:startDate/:endDate', function(req, res) {
  getRanking(res,
    moment(req.params.startDate, "YYYY-MM-DD"),
    moment(req.params.endDate, "YYYY-MM-DD"));
});

module.exports = router;

router.get("/tracks/:year/:month", function(req, res) {
  aggregatedByMonth("tracks_by_month",
    req.params.year + "-" + req.params.month, res, function(entry) {
      return {
        title: entry.key[1],
        album: entry.key[2],
        artist: entry.key[3],
        link: entry.key[4],
        image: entry.key[5],
        count: entry.value
      }
    });
});

/**
 * @param month e.g. 2016-01
 */
function aggregatedByMonth(view, month, res, entryRemap) {
  var date = moment(month, "YYYY-MM");
  date.seconds(0).hours(0).minutes(0).milliseconds(0);
  month = date.format("YYYY-MM");
  console.log("Looking for", view, month);

  var db = Database.instance();
  db.view("ranking", view, {
    startkey: [month],
    endkey: [month, {}],
    reduce: true,
    group: true,
  }, function(err, body) {
    if (err) {
      console.log(err);
      res.status(500).send({});
    } else {
      var result = {};
      result.current = date.format("YYYY-MM");
      result.prev = moment(date).subtract(1, 'month').format("YYYY-MM");
      result.next = moment(date).add(1, 'month').format("YYYY-MM");
      result.entries = body.rows;
      result.entries.sort(function(row1, row2) {
        return row2.value - row1.value;
      });
      result.entries = result.entries.slice(0, 25);

      if (entryRemap) {
        result.entries = result.entries.map(entryRemap);
      }

      res.send(result);
    }
  });
}


function ranking(startDate, endDate, callback) {
  startDate.seconds(0).hours(0).minutes(0).milliseconds(0);
  endDate.seconds(0).hours(0).minutes(0).milliseconds(0);
  console.log("Looking for", startDate.format(), "to", endDate.format());

  var db = Database.instance();
  db.view("ranking", "by_date", {
    //limit: 150,
    startkey: startDate.format("YYYY-MM-DDTHH:mm:SS.000+0000"),
    endkey: endDate.format("YYYY-MM-DDTHH:mm:SS.000+0000"),
    include_docs: true
  }, function (err, body) {
    if (!err) {
      var result = {};
      result.current = startDate.format("YYYY-MM-DD");
      result.prev = moment(startDate).subtract(1, 'days').format("YYYY-MM-DD");
      result.next = moment(startDate).add(1, 'days').format("YYYY-MM-DD");
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

      callback(null, result);
    } else {
      callback(err);
    }
  });
}

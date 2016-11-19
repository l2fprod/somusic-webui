module.exports = {
  initialize: initialize,
  instance: instance
}

function instance() {
  return db;
}

var db;

function initialize(appEnv) {
  var cloudantCreds = appEnv.getServiceCreds("somusic-cloudant");
  console.log("Connecting to", cloudantCreds.url);

  db = require('cloudant')({
    url: cloudantCreds.url,
    plugin: 'retry',
    retryAttempts: 5,
    retryTimeout: 500
  }).db.use("somusic-stats");
  db.get('_design/ranking/_view/by_date', function (err, body) {
      if (err && err.error == "not_found") {
        console.log("View does not exist. Creating it.")
        db.insert({
          _id: '_design/ranking',
          views: {
            by_date: {
              map: function (doc) {
                if (!doc.window) {
                  emit(doc.createdAt, doc.count);
                }
              }
            }
          }
        });
      }
  });
}

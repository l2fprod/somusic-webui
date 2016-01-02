module.exports = {
  initialize: initialize,
  instance: instance
}

function instance() {
  return db;
}

var db;

function initialize(appEnv) {
  var
    Cloudant = require('cloudant'),
    _ = require("underscore"),
    async = require("async"),
    cloudant,
    cloudantCreds = appEnv.getServiceCreds("cloudant"),
    dbName = "somusic-stats";
  console.log(cloudantCreds);

  var dbCreated = false;
  console.log("Credentials", cloudantCreds.username, cloudantCreds.password);
  Cloudant({account:cloudantCreds.username, password:cloudantCreds.password}, function(er, dbInstance) {
    cloudant = dbInstance;
    if (er) {
      return console.log('Error connecting to Cloudant: %s', er.message);
    }

    console.log('Connected to cloudant');
    cloudant.ping(function(er, reply) {
      if (er) {
        return console.log('Failed to ping Cloudant. Did the network just go down?');
      }

      cloudant.db.list(function(er, all_dbs) {
        if (er) {
          return console.log('Error listing databases: %s', er.message);
        }

        console.log('All my databases: %s', all_dbs.join(', '));
        _.each(all_dbs, function(name) {
          if (name === dbName) {
            dbCreated = true;
          }
        });
        if (dbCreated === false) {
          cloudant.db.create(dbName, seedDB);
        } else {
          db = cloudant.db.use(dbName);
          console.log("DB", dbName, "is already created");
        }
      });
    });
  });
}

function seedDB(callback) {
  db = cloudant.use(dbName);
  var dbEntries = [];

    async.waterfall([
        function (next) {
            var designDocs = [
              /*
              {
                _id: '_design/trips',
                    views: {
                        all: {
                            map: function (doc) { if (doc.type === 'trip') { emit(doc._id, doc); } }
                        }
                    }
                },
                {
                    _id: '_design/souvenirs',
                    views: {
                        all: {
                            map: function (doc) { if (doc.type === 'souvenir') { emit(doc._id, doc); } }
                        }
                    }
                },
                */
           ];
            async.each(designDocs, db.insert, next);
        },
        function (next) {
            async.each(dbEntries, db.insert, next);
        },
        function (next) {
            console.log("Created DB", dbName, "and populated it with initial data");
            next();
        }
    ], callback)
}

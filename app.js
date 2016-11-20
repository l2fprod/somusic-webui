/*jshint node:true*/
'use strict';
var cfenv = require('cfenv');

// load local VCAP configuration
var vcapLocal = null
try {
  vcapLocal = require("./vcap-local.json");
  console.log("Loaded local VCAP", vcapLocal);
}
catch (e) { console.error(e); }

// get the app environment from Cloud Foundry, defaulting to local VCAP
var appEnvOpts = vcapLocal ? {vcap:vcapLocal} : {}
var appEnv = cfenv.getAppEnv(appEnvOpts);
console.log(appEnv);

var newrelicCreds = appEnv.getServiceCreds("newrelic");
if (newrelicCreds) {
  require('./newrelic.js').initialize("somusic-webui", newrelicCreds.licenseKey);
}

var
  express = require('express'),
  app = express(),
  bodyParser = require('body-parser');

// get the database ready
var Database = require("./lib/database.js");
Database.initialize(appEnv);

app.use(bodyParser.json())
app.set("json spaces", "  ");

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));
app.use('/api/1/ranking', require('./lib/ranking.js'));

// start server on the specified port and binding host
app.listen(appEnv.port, appEnv.bind, function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});

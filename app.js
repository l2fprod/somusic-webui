/*jshint node:true*/
'use strict';

// This application uses express as it's web server
// for more info, see: http://expressjs.com
var
  express = require('express'),
  app = express(),
  SwaggerExpress = require('swagger-express-mw'),
  cfenv = require('cfenv'),
  bodyParser = require('body-parser');

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
  require('./newrelic.js').initialize(appEnv.name, newrelicCreds.licenseKey);
}

// get the database ready
var Database = require("./api/helpers/database.js");
Database.initialize(appEnv);

app.use(bodyParser.json())
app.set("json spaces", "  ");

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));
app.use('/api/swagger', express.static(__dirname + '/api/swagger'));
app.use('/apidocs/', express.static(__dirname + '/public/vendor/swagger-ui/dist'));

// initialize Swagger API
var config = {
  appRoot: __dirname // required config
};
SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }
  swaggerExpress.register(app);
});

// start server on the specified port and binding host
app.listen(appEnv.port, appEnv.bind, function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});

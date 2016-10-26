exports.config = {
  /**
   * Array of application names.
   */
  app_name : [],

  /**
   * Your New Relic license key.
   */
  license_key : "no-license-key-provided",

  logging : {
    /**
     * Level at which to log. 'trace' is most useful to New Relic when diagnosing
     * issues with the agent, 'info' and higher will impose the least overhead on
     * production applications.
     */
    level : "info"
  }
}

exports.initialize = function(appName, licenseKey) {
  exports.config.app_name = [appName];
  exports.config.license_key = licenseKey;
  require('newrelic');
}

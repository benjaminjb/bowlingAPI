/**
 * Created by benjaminblattberg on 9/29/16.
 */
/* jshint node: true */
/* jshint esnext: true */
'use strict';

const __ = require('lodash');

// Base config for development
// ============================================
var all = {
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 9000,
  secrets: {
    server: 'server-secret'
  },
  mongo: {
    uri: 'mongodb://localhost/bowlingAPI-dev',
    options: {
      db: {
        safe: true
      }
    }
  }
};

// Testing config
// ==============================================
var test = {
  env: "testing",
  port: 9000,
  secrets: {
    server: 'testing'
  },
  mongo: {
    uri: 'mongodb://localhost/bowlingAPI-test',
    options: {
      db: {
        safe: true
      }
    }
  }
};

// Non-test, non-development config
// ==============================================
var nonDevelopmentConfig = {
  mongo: {
    uri: process.env.MONGO_URI,
    options: JSON.parse(process.env.MONGO_OPTIONS) || {}
  },
  secrets: {
    // TODO-Integation: share server secret with teams using API
    server: 'four score and seven pins ago'
  }
};

// Merge the config objects according to NODE_ENV
// ==============================================
if (process.env.NODE_ENV && process.env.NODE_ENV != 'development') {
  var mergeConfig = process.env.NODE_ENV === "test" ? test : nonDevelopmentConfig;

  all = __.merge(all, mergeConfig);
}

// Export the config object
// ==============================================
module.exports = all;
/**
 * Created by benjaminblattberg on 10/1/16.
 */
/* jshint node: true */
/* jshint esnext: true */
'use strict';

/**
 * @Description
 *    Creates a shared logger with a shared log level
 */
const Log = require('log');
const logLevel = process.env.NODE_LOG_LEVEL || 'debug';

module.exports = new Log(logLevel);
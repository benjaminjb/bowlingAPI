/**
 * Created by benjaminblattberg on 9/30/16.
 */
/* jshint node: true */
/* jshint esnext: true */
'use strict';

const config = require('../config/index');
const log = require('../lib/log/logger');

// Basic Restify server
const restify = require('restify');
const server = restify.createServer({name: 'bowlingAPI', version: '1.0.0'});

// Add Restify middleware
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

// Add custom middleware
const customMiddleware = require('./middleware');
//server.use(customMiddleware.auth);
server.use(customMiddleware.spy);

// Add routes
//require('../lib/frame/frame.routes')(server);

// Export listen and close functions for easy server integration
exports.listen = function (port) {
  server.listen( port , () => {
    log.info('%s listening at %s', server.name, server.url);
  });
};

exports.close = function (callback) {
  server.close(callback);
};
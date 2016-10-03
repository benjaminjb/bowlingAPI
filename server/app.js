/**
 * Created by benjaminblattberg on 9/30/16.
 */
/* jshint node: true */
/* jshint esnext: true */
'use strict';

const config = require('../config/index');
const log = require('../lib/log/logger');

const mongooseDAO = require('../lib/db/mongo.controller');

// Basic Restify server
const restify = require('restify');
const server = restify.createServer({name: 'bowlingAPI', version: '1.0.0'});

// Add Restify middleware
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

// Add custom middleware
const customMiddleware = require('./middleware');
server.use(customMiddleware.spy);

// Add routes
require('../lib/frame/frame.routes')(server);
mongooseDAO.connect(config.mongo.uri,config.mongo.options);

server.listen(config.port);
log.info('%s listening at %s', server.name, server.url);

// export app so we can test it
module.exports = server;
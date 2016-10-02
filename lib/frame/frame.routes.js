/**
 * Created by benjaminblattberg on 10/1/16.
 */
/* jshint node: true */
/* jshint esnext: true */
'use strict';

const log = require('../../log/log.util');
const frameController = require('./frame.controller');

const _locationRoutes = (server) => {

  /**
   *
   */
  server.get({path: '/game', version: '1.0.0'}, frameController.indexGames);

  /**
   *
   */
  server.get({path: '/game/:id', version: '1.0.0'}, frameController.getGame);
};

module.exports = _locationRoutes;

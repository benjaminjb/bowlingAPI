/**
 * Created by benjaminblattberg on 10/1/16.
 */
/* jshint node: true */
/* jshint esnext: true */
'use strict';

const log = require('../log/logger');
const frameController = require('./frame.controller');

const _locationRoutes = (server) => {

  // Game-level paths
  ////////////////////////////////////////
  /**
   * @Description
   *     Creates game, returns gameNumber
   */
  server.post({path: '/game', version: '1.0.0'}, frameController.createGame);

  /**
   * @Description
   *     Updates current player's current frame
   */
  server.put({path: '/game/:game_id', version: '1.0.0'}, frameController.updateFrame);

  /**
   * @Description
   *     Gets current state of the game
   */
  server.get({path: '/game/:game_id', version: '1.0.0'}, frameController.getGame);
};

module.exports = _locationRoutes;

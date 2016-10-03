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
   *    Returns all games with current scores
   */
  server.get({path: '/game', version: '1.0.0'}, frameController.indexGames);

  /**
   * @Description
   *     Gets :id game, with all frames
   */
  server.get({path: '/game/:game_id', version: '1.0.0'}, frameController.getGame);

  /**
   * @Description
   *     Creates game, returns gameNumber
   */
  server.post({path: '/game', version: '1.0.0'}, frameController.createGame);

  // Round-level paths
  ////////////////////////////////////////
  /**
   * @Description
   *    Returns info about current round
   */
  server.get({path: '/round/:game_id', version: '1.0.0'}, frameController.getCurrentRound);

  /**
   * @Description
   *    Returns info about given round
   */
  server.get({path: '/round/:game_id/:round_id', version: '1.0.0'}, frameController.getGivenRound);

  // Frame-level paths
  ////////////////////////////////////////
  /**
   * @Description
   *     Gets current player's current frame
   */
  server.get({path: '/frame/:game_id/:round_id/:player', version: '1.0.0'}, frameController.getFrame);

  /**
   * @Description
   *     Updates current player's current frame
   */
  server.put({path: '/frame/:game_id/:round_id/:player', version: '1.0.0'}, frameController.updateFrame);

};

module.exports = _locationRoutes;

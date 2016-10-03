/**
 * Created by benjaminblattberg on 10/1/16.
 */
/* jshint node: true */
/* jshint esnext: true */
'use strict';

const config = require('../../config/index');
const log = require('../log/logger');

// Helper functions
const createRound = require('../utils/frame.createRound');
const getGameInfo = require('../utils/frame.getGameInfo');

const createOrUpdateFrame = require('../utils/frame.createOrUpdate');

const getCurrentFrame = require('../utils/frame.getCurrent');
const getPlayers = require('../utils/frame.getPlayers');
const nextPlayerUp = require('../utils/frame.nextPlayerUp');
const updateScore = require('../utils/frame.updateScore');


/**
 * @Description
 *    Arrange helper functions to be easily called by routes
 */
const _exports = () => {
  return {
    createGame: createGame,
    updateFrame: updateFrame,
    getGame: getGame
  };

  /**
   * @Description
   *    createGame - creates game for players given
   * @param req - give an array of strings (1-12) in req.body.players
   * @param res
   * @param next
   *
   * @return success example with one player
   * {
   *   "status": 1,
   *   "data": {
   *   "players": [
   *    "Walker"
   *   ],
   *   "gameNumber": "57f2357e46c7c78518ef6a2c",
   *   "round": 1,
   *   "nextPlayer": "Walker"
   * }
   *
   * @return error example
   * {
   *  "status": 0,
   *  "error": "Need an array of 1 to 12 players"
   * }
   */
  function createGame(req, res, next) {
    let players = req.body.players;
    createRound(players)
      .then( (results) => {
        return res.send(200, {status: 1, data: results});
      })
      .catch( err => {
        log.error(err.message);
        return res.send(400, {status: 0, error: err.message });
      });
  }


  /**
   * @Description
   *    getGame
   * @param req - req.params.game_id should be a gameNumber
   * @param res
   * @param next
   *
   * @return success example with one player
   * {
   *   "status": 1,
   *   "data": {
   *   "players": [
   *    "Walker"
   *   ],
   *   "gameNumber": "57f2357e46c7c78518ef6a2c",
   *   "round": 1,
   *   "nextPlayer": "Walker"
   * }
   *
   * @return error example
   * {
   *  "status": 0,
   *  "error": "Need an array of 1 to 12 players"
   * }
   */
  function getGame(req, res, next) {
    let game_id = req.params.game_id;
    getGameInfo(game_id)
        .then( (results) => {
          return res.send(200, {status: 1, data: results});
        })
        .catch( err => {
          log.error(err.message);
          return res.send(400, {status: 0, error: err.message });
        });
  }

  /**
   * @Description
   *    updateFrame
   * @param req
   * @param res
   * @param next
   */
  function updateFrame(req, res, next) {
    let bodyObj = req.body;
    let game_id = req.params.game_id;
    let round_id = req.params.round_id;
    let player = req.params.player;
    Promise.resolve(round_id)
      .then((roundNumber) => {
        if (roundNumber) return roundNumber;
        return getCurrentFrame(game_id);
      })
      .then((realRoundNumber) => {
        round_id = round_id ? round_id : realRoundNumber;
        return nextPlayerUp(game_id, round_id, player);
      })
      .then((actualPlayer) => {
        if (Array.isArray(actualPlayer)) {
          return createRound(actualPlayer, round_id + 1, game_id);
        }
        return actualPlayer;
      }).then((actualPlayer) => {
        player = player ? player : actualPlayer;
        let updateObj = Object.assign({
          gameNumber : game_id,
          player     : player,
          frameNumber: round_id
        }, bodyObj);
        return createOrUpdateFrame(updateObj)
      })
      //.then((results) => {
      //  return setUpNewFrame(results);
      //})
      .then( (results) => {
        return res.send(200, {status: 1, data: results});
      })
      .catch( err => {
        log.error(err.message);
        return res.send(400, {status: 0, error: err.message });
      });
  }

};

module.exports = _exports();
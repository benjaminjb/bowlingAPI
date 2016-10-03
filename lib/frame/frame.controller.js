/**
 * Created by benjaminblattberg on 10/1/16.
 */
/* jshint node: true */
/* jshint esnext: true */
'use strict';

const config = require('../../config/index');
const log = require('../log/logger');

// Helper functions
const createOrUpdateFrame = require('../utils/frame.createOrUpdate');
const createRound = require('../utils/frame.createRound');
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
    getCurrentRound: getCurrentRound,
    getGivenRound: getGivenRound,
    getFrame: getFrame,
    updateFrame: updateFrame
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
   *  "status": 1,
   *  "data": [
   *     {
   *       "__v": 0,
   *       "order": 0,
   *       "nextPlayer": [
   *         "Walker"
   *       ],
   *       "gameNumber": "57f197afb1bbe94499968f4f",
   *       "player": "Walker",
    *      "_id": "57f197b0b1bbe94499968f50",
   *       "rolls": [],
   *       "finished": false,
   *       "frameNumber": 1
   *     }
   *   ]
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
   *    getCurrentRound - given game number
   * @param req
   * @param res
   * @param next
   */
  function getCurrentRound(req, res, next) {
    let game_id = req.params.game_id;
    getCurrentFrame(game_id)
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
   *    getGivenRound
   * @param req
   * @param res
   * @param next
   */
  function getGivenRound(req, res, next) {
    let game_id = req.params.game_id;
    getCurrentFrame(game_id)
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
   *    getFrame
   * @param req
   * @param res
   * @param next
   */
  function getFrame(req, res, next) {
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
/**
 * Created by benjaminblattberg on 10/1/16.
 */
/* jshint node: true */
/* jshint esnext: true */
'use strict';

const config = require('../../config/index');
const log = require('../log/logger');

// Helper function
const createOrUpdateFrame = require('../utils/frame.createOrUpdate');
const createRound = require('../utils/frame.createRound');
const getCurrentFrame = require('../utils/frame.getCurrent');
const nextPlayerUp = require('../utils/frame.nextPlayerUp');
const getAllGames = require('../utils/game.getAllGames');


/**
 * @Description
 *    Arrange helper functions to be easily called by routes
 */
const _exports = () => {
  return {
    indexGames: indexGames,
    getGame: getGame,
    createGame: createGame,
    getCurrentRound: getCurrentRound,
    getGivenRound: getGivenRound,
    getFrame: getFrame,
    updateFrame: updateFrame
  };

  /**
   * @Description
   *    indexGames
   * @param req
   * @param res
   * @param next
   */
  function indexGames(req, res, next) {
    getAllGames().then( (results) => {
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
   * @param req
   * @param res
   * @param next
   */
  function getGame(req, res, next) {
  }

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
   *    getCurrentRound
   * @param req
   * @param res
   * @param next
   */
  function getCurrentRound(req, res, next) {

  }

  /**
   * @Description
   *    getGivenRound
   * @param req
   * @param res
   * @param next
   */
  function getGivenRound(req, res, next) {
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
  }

};

module.exports = _exports();
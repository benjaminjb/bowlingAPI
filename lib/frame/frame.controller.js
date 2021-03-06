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
const updateFrameChain = require('../utils/frame.updateFrameChain');

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
   *{
   *  "status": 1,
   *    "data": {
   *  "players": [
   *    "Malcolm",
   *    "Weapon",
   *    "OS"
   *  ],
   *      "gameNumber": "57f30e7779c9e8b0178398c3",
   *      "round": 1,
   *      "nextPlayer": "Malcolm"
   *  }
   *}
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
          log.error("Error creating game",err.message);
          log.debug('Stack', err.stack);
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
   *  "status": 1,
   *  "data": {
   *    "frameResults": {
   *      "1": [
   *        {
   *          "rolls": [
   *            3
   *          ],
   *          "player": "Malcolm",
   *          "frameNumber": 1,
   *          "score": 3
   *        }
   *     ]
   *   },
   *   "totalScores": [
   *     {
   *       "player": "Malcolm",
   *        "score": 3
   *      }
   *      ]
   *    }
   * }
   */
  function getGame(req, res, next) {
    let game_id = req.params.game_id;
    getGameInfo(game_id)
        .then( (results) => {
          return res.send(200, {status: 1, data: results});
        })
        .catch( err => {
          log.error("Error getting game info",err.message);
          log.debug('Stack', err.stack);
          return res.send(400, {status: 0, error: err.message });
        });
  }

  /**
   * @Description
   *    updateFrame
   * @param req - req.params.game_id should be a gameNumber, req.body.rolls is the new roll to add
   * @param res
   * @param next
   *
   * @return success example with one player
   * {
   *  "status": 1,
   *  "data": {
   *    "_id": "57f30f2679c9e8b0178398c8",
   *    "gameNumber": "57f30f2679c9e8b0178398c7",
   *    "player": "Malcolm",
   *     "nextPlayer": [
   *     "Malcolm"
   *   ],
   *   "order": 0,
   *   "__v": 1,
   *   "rolls": [
   *     3
   *   ],
   *   "finished": false,
   *   "frameNumber": 1
   *   }
   * }
   *
   * @return error example
   * {
   *  "status": 0,
   *  "error": "Can't score more than 10 in one roll"
   * }
   */
  function updateFrame(req, res, next) {
    let bodyObj = req.body;
    let gameId = req.params.game_id;
    updateFrameChain(gameId, bodyObj)
        .then( (results) => {
          return res.send(200, {status: 1, data: results});
        })
        .catch( err => {
          log.error("Error updating frame",err.message);
          log.debug('Stack', err.stack);
          return res.send(400, {status: 0, error: err.message });
        });
  }

};

module.exports = _exports();
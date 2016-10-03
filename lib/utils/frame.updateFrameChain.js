/**
 * Created by benjaminblattberg on 10/3/16.
 */
/* jshint node: true */
/* jshint esnext: true */
'use strict';

// Accessory Modules
const mongooseDAO = require('../db/mongo.controller');
const log = require('../log/logger');
const __ = require('lodash');

// Helper function
const getCurrentPlayer = require('./frame.getCurrentPlayer');
const getCurrentRound = require('./frame.getCurrentRound');
const getPlayers = require('./frame.getPlayers');
const createRound = require('./frame.createRound');
const updateScore = require('./frame.updateScore');


/**
 * @Description
 *    Runs chain of functions for updating
 * @param gameId - game to update
 * @param updateBody - object to update from: `{rolls: 4}`
 * @param flag - Flag to allow update from all fields
 */
function updateFrameChain(gameId, updateBody, flag) {
  let playerDoc, currentRound;
  // 1) Get current play from game
  return getCurrentPlayer(gameId)
    .then((player) => {
      playerDoc = player;
      // 1a) If there's a player, update that player with the new rolls
      if (playerDoc) {
        // NOTE: If passed a flag, this function will update all keys of updateBody
        return updateScore(playerDoc, updateBody, true, flag);
      }
    })
    .then(() => {
      if (playerDoc) {
        return playerDoc.frameNumber
      }
      return getCurrentRound(gameId);
    })
    .then((round) => {
      currentRound = round;
      if (playerDoc) { return; }
      if (currentRound !== 0) {
        return getPlayers(gameId)
      } else {
        return Promise.reject(Error('Game is completed and can no longer be updated '+gameId));
      }
    })
    .then((playersList) => {
      if (playersList) {
        playersList = __.map(playersList, 'player');
        return createRound(playersList, currentRound, gameId)
      }
    })
    .then((success) => {
      if (success) {
        return updateFrameChain(gameId, updateBody)
      }
    })
    .catch((err) => {
      log.error('Trouble updating current frame',err.message);
      log.debug('Stack', err.stack);
      return Promise.reject(Error('Trouble updating current frame: '+err));
    })
}

module.exports = updateFrameChain;
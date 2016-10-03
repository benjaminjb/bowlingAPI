/**
 * Created by benjaminblattberg on 10/3/16.
 */
/* jshint node: true */
/* jshint esnext: true */
'use strict';

const mongooseDAO = require('../db/mongo.controller');
const mongoose = require('mongoose');
const log = require('../log/logger');

/**
 * @Description
 *    Gets the current player for a game
 * @param gameNumber
 */
function getCurrentPlayer(gameNumber) {
  if (typeof gameNumber === 'string') {
    gameNumber = mongoose.Types.ObjectId(gameNumber);
  }
  return mongooseDAO.findAndOrder('frameModel', {gameNumber: gameNumber, finished: false}, {frameNumber: 1,order:1})
    .then((unfinishedFrames) => {
      if (unfinishedFrames.length > 0) {
        return unfinishedFrames[0];
      } else {
        return false;
      }
    })
    .catch((err) => {
      log.error('Trouble getting current frame',err.message);
      log.debug('Stack', err.stack);
      throw new Error('Trouble getting current frame',err);
    })
}

module.exports = getCurrentPlayer;
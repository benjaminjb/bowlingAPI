/**
 * Created by benjaminblattberg on 10/3/16.
 */
/* jshint node: true */
/* jshint esnext: true */
'use strict';

const mongooseDAO = require('../db/mongo.controller');
const log = require('../log/logger');

const getPlayers = require('./frame.getPlayers');

function getCurrentPlayer(gameNumber) {
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
      throw new Error('Trouble getting current frame',err);
    })
}

module.exports = getCurrentPlayer;
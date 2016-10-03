/**
 * Created by benjaminblattberg on 10/1/16.
 */
/* jshint node: true */
/* jshint esnext: true */
'use strict';

const mongoose = require('mongoose');
const mongooseDAO = require('../db/mongo.controller');
const log = require('../log/logger');

function getPlayers(gameNumber) {
  if (typeof gameNumber === 'string') {
    gameNumber = mongoose.Types.ObjectId(gameNumber);
  }
  return mongooseDAO.find('frameModel',
      {
        gameNumber: gameNumber,
        frameNumber: 1
      })
      .then((playersArray) => {
        return playersArray;
      })
      .catch((err) => {
        log.error('Trouble getting players',err.message);
        log.debug('Stack', err.stack);
        return Promise.reject(Error('Trouble getting current frame'+err.message));
      })
}

module.exports = getPlayers;
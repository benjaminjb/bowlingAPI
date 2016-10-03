/**
 * Created by benjaminblattberg on 10/1/16.
 */
/* jshint node: true */
/* jshint esnext: true */
'use strict';

const mongoose = require('mongoose');
const mongooseDAO = require('../db/mongo.controller');
const log = require('../log/logger');
const getPlayers = require('./frame.getPlayers');

/**
 * @Description
 *    Get the number of the current game
 * @param gameNumber - the game id
 */
function getCurrentRound(gameNumber) {
  if (typeof gameNumber === 'string') {
    gameNumber = mongoose.Types.ObjectId(gameNumber);
  }
  return getPlayers(gameNumber)
    .then((playersArray) => {
      let length = playersArray.length;
      return mongooseDAO.aggregate('frameModel', [
        {'$match': {gameNumber:gameNumber,finished:true}},
        {'$group': {_id: '$frameNumber', count: { $sum: 1 }}},
        {'$match': {count: {'$gte': length}}},
        {'$group': {_id: null, max: {'$max': '$_id'}}}
      ])
    })
    .then((frameAllFinished) => {
      let max = 0;
      if (frameAllFinished[0]) {
        max = frameAllFinished[0].max;
      }
      return (max + 1) % 11
    })
    .catch((err) => {
      log.error('Trouble getting current frame',err.message);
      log.debug('Stack', err.stack);
      return Promise.reject(Error('Trouble getting current frame '+err.message));
    })
}

module.exports = getCurrentRound;
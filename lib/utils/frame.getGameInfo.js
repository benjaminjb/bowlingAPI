/**
 * Created by benjaminblattberg on 10/2/16.
 */
/* jshint node: true */
/* jshint esnext: true */
'use strict';

const mongoose = require('mongoose');
const mongooseDAO = require('../db/mongo.controller');
const log = require('../log/logger');
const __ = require('lodash');
const transformFrame = require('./frame.transformFrame');

function getGameInfo(gameNumber) {
  if (typeof gameNumber === 'string') {
    gameNumber = mongoose.Types.ObjectId(gameNumber);
  }
  // Find all frames that match the gameNumber, order by 1) frameNumber and 2) order, both ascending
  return mongooseDAO.findAndOrder('frameModel', {gameNumber: gameNumber}, [['frameNumber',1], ['order',1]])
    .then((results) => {
      // Trim and transform the frames, group by frameNumber
      let trimmedResults = __.map(results, transformFrame);
      let frameResults = __.groupBy(trimmedResults,'frameNumber');
      let playerScores = __.chain(trimmedResults)
        .groupBy('player')
        .map(addScores)

      return {frameResults: frameResults, totalScores: playerScores}
    })
    .catch((err) => {
      log.error('Trouble getting current frame',err.message);
      log.debug('Stack', err.stack);
      return Promise.reject(Error('Trouble getting current frame '+err.message));
    })
}

function addScores(player) {
  let score = __.chain(player).map('score').reduce((sum, n) => {
    return sum + n;
  }, 0);
  let name = player[0] ? player[0].player : "";

  return {player: name, score: score}
}
module.exports = getGameInfo;
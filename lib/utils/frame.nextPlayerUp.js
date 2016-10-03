/**
 * Created by benjaminblattberg on 10/1/16.
 */
/* jshint node: true */
/* jshint esnext: true */
'use strict';

const mongooseDAO = require('../db/mongo.controller');
const getCurrentRound = require('./frame.getCurrentRound');

function nextPlayerUp(gameNumber, frameNumber, player) {
  return getFrameNumber(gameNumber, frameNumber)
      .then( (frameNumberResult) => {
        return getPlayer(gameNumber, frameNumberResult, player)
      })
      .then((playerResult) => {
        if (!playerResult.length) {return null};
        return !playerResult[0].finished ? playerResult[0].player : playerResult[0].nextPlayer;
      })
}

function getFrameNumber(gameNumber, frameNumber) {
  if (frameNumber) {
    return Promise.resolve(frameNumber);
  }
  return getCurrentRound(gameNumber)
}

function getPlayer(gameNumber, frameNumber, player) {
  if (player) {
    return Promise.resolve([player]);
  }
  return mongooseDAO.findAndOrder('frameModel',
      {
        gameNumber :gameNumber,
        frameNumber:frameNumber,
        finished   :false
      },
      {
        order: 1
      });
}

module.exports = nextPlayerUp;
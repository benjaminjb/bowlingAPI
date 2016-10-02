/**
 * Created by benjaminblattberg on 10/1/16.
 */
/* jshint node: true */
/* jshint esnext: true */
'use strict';

const mongooseDAO = require('../db/mongo.controller');
const log = require('../log/logger');

function getPlayers(gameNumber) {
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
        throw new Error('Trouble getting current frame',err);
      })
}

module.exports = getPlayers;
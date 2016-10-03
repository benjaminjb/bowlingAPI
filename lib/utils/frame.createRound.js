/**
 * Created by benjaminblattberg on 10/1/16.
 */
/* jshint node: true */
/* jshint esnext: true */
'use strict';

const mongoose = require('mongoose');
const mongooseDAO = require('../db/mongo.controller');
const nextPlayerUp = require('./frame.nextPlayerUp');
const log = require('../log/logger');

function createRound(players, frameNumber, gameNumber) {
  if (!players || !Array.isArray(players)) {
    return Promise.reject(Error("Need an array of players"));
  }

  if (players.length < 1 || players.length > 12) {
    return Promise.reject(Error("Need an array of 1 to 12 players"));
  }

  let objectId = gameNumber || new mongoose.Types.ObjectId;
  let frameId = frameNumber || 1;
  let promises = [];

  for (let i = 0; i < players.length; i++) {
    let nextPlayer = players[i + 1] ? players[i + 1] : players;
    let frameVars = {
      gameNumber : objectId,
      player     : players[i],
      nextPlayer : nextPlayer,
      frameNumber: frameId,
      order      : i
    };
    promises.push(mongooseDAO.save('frameModel', frameVars));
  }

  return Promise.all(promises)
    .then((res) => {
        log.debug("Created round for players", players);
        return nextPlayerUp(objectId, frameId);
    })
    .then((playerUp) => {
      return {players: players, gameNumber: objectId, round: frameId, nextPlayer: playerUp};
    })
    .catch((err) => {
      log.error("Error creating round", err);
      return Promise.reject(Error("Error creating round " + frameNumber + " for players", players));
    })
}

module.exports = createRound;
/**
 * Created by benjaminblattberg on 10/1/16.
 */
/* jshint node: true */
/* jshint esnext: true */
'use strict';

const mongoose = require('mongoose');
const createOrUpdateFrame = require('./frame.createOrUpdate');

function createRound(players, frameNumber, gameNumber) {
  return new Promise( (resolve,reject) => {
    if (!players || !Array.isArray(players)) {
      reject(new Error("Need an array of players"));
    }

    if (players.length < 1 || players.length > 12) {
      reject(Error("Need an array of 1 to 12 players"));
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
      promises.push(createOrUpdateFrame(frameVars));
    }

    return Promise.all(promises)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(Error("Error creating round " + frameNumber + " for players", players));
        })
  })
}

module.exports = createRound;
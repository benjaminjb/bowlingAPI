/**
 * Created by benjaminblattberg on 10/1/16.
 */
/* jshint node: true */
/* jshint esnext: true */
'use strict';

const mongooseDAO = require('../db/mongo.controller');
const getCurrentFrame = require('./frame.getCurrent');

function nextPlayerUp(gameNumber, frameNumber, player) {
  if (!player) {
    if (!frameNumber) {
      getCurrentFrame(gameNumber)
        .then((number) => {
          frameNumber = number;
        });
    }
    mongooseDAO.findAndOrder('frameModel',
        {
          gameNumber :gameNumber,
          frameNumber:frameNumber,
          finished   :false
        },
        {
          order: -1
        })
      .then((foundPlayer) => {
        player = foundPlayer
      })
  }
  return player.nextPlayer;
  // get last player from db
  //gameNumber,
  // aggregate on gameNumber , max frameNumber, lowest order

  // does this player get another roll? less than 2 rolls and no strike
  // give this player back

  // is there a next player
  //

  //

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
      let nextPlayer = players[i + 1] ? players[i + 1] : players[0];
      let frameVars = {
        gameNumber: objectId,
        player: players[i],
        nextPlayer: nextPlayer,
        frameNumber: frameId
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

module.exports = nextPlayerUp;
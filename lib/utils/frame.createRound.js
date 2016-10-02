/**
 * Created by benjaminblattberg on 10/1/16.
 */
/* jshint node: true */
/* jshint esnext: true */
'use strict';

const mongoose = require('mongoose');
const createOrUpdateFrame = require('./frame.createOrUpdate');

function createRound(players, frameNumber, gameNumber) {
  console.log('players',players)
  //return new Promise( (resolve, reject) => {
    if (!players || !Array.isArray(players)) {
      console.log(1)
      //return reject(new Error("Need an array of players"));
    }

    if (players.length < 1 || players,length > 12) {
      console.log(2)
      //return reject(new Error("Need from 1 to 12 players for league play"));
    }

    let objectId = gameNumber || new mongoose.Types.ObjectId;
    let frameId  = frameNumber || 1;
    let promises = [];

    console.log(3, objectId, frameId, promises);
    for (let i=0; i < players.length; i++) {
      console.log("i",i)
      let nextPlayer = players[i+1] ? players[i+1] : players[0];
      let frameVars = {
        gameNumber : objectId,
        player     : players[i],
        nextPlayer : nextPlayer,
        frameNumber: frameId
      };
      promises.push(createOrUpdateFrame(frameVars));
    }

    console.log('promises.length',promises.length)
    return Promise.all(promises)
        .then( (res) => {
          console.log('res',res)
          //return resolve(res);
        })
        .catch( (err) => {
          console.log('err',err)
          //return reject(err);
        })
  //})
}

module.exports = createRound;
/**
 * Created by benjaminblattberg on 10/2/16.
 */
/* jshint node: true */
/* jshint esnext: true */
'use strict';

const mongooseDAO = require('../db/mongo.controller');
const __ = require('lodash');
const log = require('../log/logger');

function newFrameFromOld(player) {
  let newFrame = {
    gameNumber: player.gameNumber,
    frameNumber: player.frameNumber + 1,
    player: player.player,
    nextPlayer: player.nextPlayer,
    order: player.order
  };

  if (player.special == 'spare') {
    newFrame.rolls = [player._id];
  }
  if (player.special == 'strike') {
    newFrame.rolls = [player._id, player._id];
  }

  return newFrame;
}

function updateScore(player, updateBody, flag) {
  var id, newScore, playerSaved;

  return Promise.resolve(player)
    // Get the player
    .then((playerA) => {
      if (playerA.player) {return playerA}
      return mongooseDAO.findOne('frameModel', player)
    })
    .then((playerDoc) =>{
      // Update the entire playerDoc -- rolls, special, finished
      // Update the rolls
      // 1) If playerDoc.rolls doesn't exist, add updateBody.rolls as an array
      if (!playerDoc.rolls
          || (Array.isArray(playerDoc.rolls) && playerDoc.rolls.length == 0 )) {
        playerDoc.rolls = Array.isArray(updateBody.rolls) ? updateBody.rolls : [updateBody.rolls];
      } else {
        // 2) If playerDoc.rolls exists, check for the first ObjectID
        let index = __.findIndex(playerDoc.rolls, (roll) => {
          return typeof roll === 'object';
        });
        // 2a) If there was an ObjectID, save it before replacing with the value in updateBody.rolls
        if (index > -1) {
          id = playerDoc.rolls[index];
          newScore = updateBody.rolls;
          playerDoc.rolls.splice(index, 1);
        }
        // 3) Add the values to the rolls
        Array.isArray(updateBody.rolls) ? playerDoc.rolls.concat(updateBody.rolls) : playerDoc.rolls.push(updateBody.rolls)
      }
      if (updateBody.rolls == 10) {
        updateBody.special = "strike"
      }
      delete updateBody.rolls;

      //  Check, update for special and finished
      let score = __.reduce(playerDoc.rolls, function(sum, n) {
        if (typeof n === 'number') { return sum + n; }
        return sum;
      }, 0);

      if (score == 10 || updateBody.special) {
        // 1) Update the special flag
        if (score == 10 && !updateBody.special) {
          playerDoc.special = "spare";
        }
        if (updateBody.special) {
          playerDoc.special = updateBody.special;
        }
      }
      // Update the finished flag if we have more than one roll or the score is over 10
      let length = __.countBy(playerDoc.rolls, function (num) {
        return typeof num;
      })['number'];

      if (!playerDoc.finished
          && ( length > 1 || score >= 10 )) {
        playerDoc.finished = true;
      }

      // Allow for updating of other fields if flag is passed
      if (flag) {
          playerDoc = Object.assign(playerDoc, updateBody)
        }

      return mongooseDAO.save('frameModel',playerDoc);
      })
    .then((returnedPlayer) => {
      playerSaved = returnedPlayer
    // If it was a strike or spare, prepare the next frame
      if (returnedPlayer.special) {
        let futurePlayerDoc = newFrameFromOld(returnedPlayer);
        return mongooseDAO.save('frameModel', futurePlayerDoc);
      }
    })
    .then((result) => {
      if (id && newScore) {
        return updateScore({_id: id}, {rolls: newScore})
      }
    })
    .then((res) => {
      log.debug("Updated score(s)", res);
      return playerSaved;
    })
    .catch((err) => {
      log.error("Error updating scores", err);
      return Promise.reject(Error("Error updating scores", err));
    })
}

module.exports = updateScore;
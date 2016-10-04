/**
 * Created by benjaminblattberg on 10/2/16.
 */
/* jshint node: true */
/* jshint esnext: true */
'use strict';

const mongoose = ('require');
const mongooseDAO = require('../db/mongo.controller');
const __ = require('lodash');
const log = require('../log/logger');

/**
 * @Description
 *    Updates a frame, with all of the bowling logic
 * @param player - a player object or query object
 * @param updateBody - an update object
 * @param doubleUpdate - an optional flag that allows one level of recursion
 * @param flag - an optional flag that allows for other fields to be updated
 */
function updateScore(player, updateBody, doubleUpdate, flag) {
  var id, newScore, playerSaved;
  var throwLimit = 2;
  var scoreLimit = 10;

  return Promise.resolve(player)
    // 1) Get the player
    .then((playerA) => {
      // If player object was given as a param, return it, otherwise find the document in the DB
      if (playerA.player) {return playerA}
      return mongooseDAO.findOne('frameModel', player)
    })
    .then((playerDoc) =>{
      // 2) Update the entire playerDoc -- rolls, special, finished

      // ---------- Update the rolls --------------//
      // If playerDoc.rolls doesn't exist, add updateBody.rolls as an array
      if (!playerDoc.rolls
          || (Array.isArray(playerDoc.rolls) && playerDoc.rolls.length == 0 )) {
        playerDoc.rolls = Array.isArray(updateBody.rolls) ? updateBody.rolls : [updateBody.rolls];
      } else {
        // 2B) If playerDoc.rolls exists, check for the first ObjectID
        let index = __.findIndex(playerDoc.rolls, (roll) => {
          return typeof roll === 'object';
        });
        // If there was an ObjectID, save it before replacing with the value in updateBody.rolls
        if (index > -1) {
          id = playerDoc.rolls[index];
          newScore = updateBody.rolls;
          playerDoc.rolls.splice(index, 1);
        }
        // Add the values to the rolls
        Array.isArray(updateBody.rolls) ? playerDoc.rolls.concat(updateBody.rolls) : playerDoc.rolls.push(updateBody.rolls)
      }

      // ------------- Update the special and finished flags ------------//
      // Update the special setting for the updateBody in preparation
      if (updateBody.rolls == 10) {
        updateBody.special = "strike"
      }

      // Check and update for special -- prepare score
      let score = __.reduce(playerDoc.rolls, (sum, n) => {
        if (typeof n === 'number') { return sum + n; }
        return sum;
      }, 0);

      // Check score and updateBody.special to set the playerDoc.special flag
      if (score == 10 || updateBody.special) {
        if (score == 10 && !updateBody.special) {
          playerDoc.special = "spare";
        }
        if (updateBody.special) {
          playerDoc.special = updateBody.special;
        }
      }

      // Check number of rolls
      let length = __.countBy(playerDoc.rolls, function (num) {
        return typeof num;
      })['number'];

      // Set the throw and score limit for the special case of
        // a) the 10th frame
        // b) if there's a strike or spare that requires a fill ball
      if (playerDoc.special && playerDoc.frameNumber == 10) {
        throwLimit = 3;
        scoreLimit = 30;
      }

      // Update the finished flag if we have more than the roll limit or the score is over a score limit
      if (!playerDoc.finished
          && (length >= throwLimit || score >= scoreLimit )) {
        playerDoc.finished = true;
      }

      // Allow for updating of other fields if flag is passed
        // This is unused right now but would allow this function to be used for updating other fields
      if (flag) {
        delete updateBody.rolls;
        playerDoc = Object.assign(playerDoc, updateBody)
      }

      // --------------- Save the updated player frame ------------ //
      return mongooseDAO.save('frameModel',playerDoc);
      })
    .then((returnedPlayer) => {
      playerSaved = returnedPlayer;
    // 3)  If it was a strike or spare (in special flag), prepare the next frame
        // -- doubleUpdate flag allows for controlled cascade -- bowling only ever recurses once
        // -- doesn't allow future frame to be created in 10th frame;
      if (returnedPlayer.special && doubleUpdate && returnedPlayer.frameNumber < 10) {
        let futurePlayerDoc = newFrameFromOld(returnedPlayer);
        return mongooseDAO.save('frameModel', futurePlayerDoc);
      }
    })
    .then((result) => {
    // 4) Recurse once if there's an id of a frame to update
        // (a previous frame that had scored a spare or strike)
        // and a score that needs to be inserted into the previous frame
      if (id && newScore) {
        if (typeof id === 'string') {
          id = mongoose.Types.ObjectId(gameNumber);
        }
        return updateScore({_id: id}, {rolls: newScore}, false)
      }
    })
    .then((res) => {
    // 5) Finish up by returning the saved frame
      log.info("Updated score(s)");
      return playerSaved;
    })
    .catch((err) => {
      log.error("Error updating scores", err);
      log.debug("Stack", err.stack);
      return Promise.reject(Error("Error updating scores "+err));
    })
}

/**
 * @Description
 *    Creates a new future frame if someone scores a spare or strike
 * @param player
 */
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

module.exports = updateScore;
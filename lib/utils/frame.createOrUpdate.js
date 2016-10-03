/**
 * Created by benjaminblattberg on 10/1/16.
 */
/* jshint node: true */
/* jshint esnext: true */
'use strict';

const mongooseDAO = require('../db/mongo.controller');

function createOrUpdateFrame(frameVars) {
  let queryFrame = {
    gameNumber : frameVars.gameNumber,
    player     : frameVars.player,
    frameNumber: frameVars.frameNumber
  };

  let updateFrame = Object.assign({
    nextPlayer: frameVars.nextPlayer,
    order     : frameVars.order
  }, queryFrame);

  if (frameVars.rolls) { updateFrame.rolls = frameVars.rolls; }
  if (frameVars.finished) { updateFrame.finished = frameVars.finished; }

  return mongooseDAO.findOneAndUpsert('frameModel', queryFrame,updateFrame);
}

module.exports = createOrUpdateFrame;
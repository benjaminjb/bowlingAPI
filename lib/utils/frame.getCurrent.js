/**
 * Created by benjaminblattberg on 10/1/16.
 */
/* jshint node: true */
/* jshint esnext: true */
'use strict';

const mongooseDAO = require('../db/mongo.controller');
const log = require('../log/logger');
const getPlayers = require('./frame.getPlayers');

function getCurrentFrame(gameNumber) {
  return getPlayers(gameNumber)
    .then((playersArray) => {
      let length = playersArray.length;
      return mongooseDAO.aggregate('frameModel', [
        {'$match': {gameNumber:gameNumber,finished:true}},
        {'$group': {_id: '$frameNumber', count: { $sum: 1 }}},
        {'$match': {count: {'$gte': length}}},
        {'$group': {_id: null, max: {'$max': '$_id'}}}
      ])
    })
    .then((frameAllFinished) => {
      //console.log('!!!!!',frameAllFinished)
      let max = 0;
      if (frameAllFinished[0]) {
        max = frameAllFinished[0].max;
      }
      return (max + 1) % 11
    })
    .catch((err) => {
      log.error('Trouble getting current frame',err.message);
      throw new Error('Trouble getting current frame',err);
    })
}

//db.frames.aggregate([{'$match': {gameNumber:ObjectId("57f1c756bcd71b720807b4f5"),finished:true}},{'$group': {_id: '$frameNumber', count: { $sum: 1 }}},{'$match': {count: {'$gte': 2}}},{'$group': {_id: null, max: {'$max': '$_id'}}}])
module.exports = getCurrentFrame;
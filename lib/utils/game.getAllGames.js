/**
 * Created by benjaminblattberg on 10/2/16.
 */
/* jshint node: true */
/* jshint esnext: true */
'use strict';

const mongooseDAO = require('../db/mongo.controller');
const log = require('../log/logger');
const getCurrentFrame = require('./frame.getCurrent');

function getAllGames() {
  return mongooseDAO.aggregate('frameModel', [
    {'$group': {_id: {game: '$gameNumber', player:'$player'}, score: { $push: '$rolls' }}},
  ])
  .then((allGames) => {
    let frameInfo;
    mongooseDAO.aggregate('frameModel', [
      {'$group': {_id: {game: '$gameNumber', player:'$player'}, score: { $push: '$rolls' }}},
    ])

    return {scoreInfo: allGames, frameInfo: frameInfo}
  })
  .catch((err) => {
    log.error('Trouble getting all games',err.message);
    throw new Error('Trouble getting all games',err);
  })
}

//{'$match': {gameNumber:ObjectId("57f14007d9c3c7f8240acf68"),finished:true}},
//{'$group': {_id: '$frameNumber', count: { $sum: 1 }}},
//{'$match': {count: {'$gte': 3}}},
//{'$group': {_id: null, max: {'$max': '$_id'}}}
module.exports = getAllGames;
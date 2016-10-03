/**
 * Created by benjaminblattberg on 10/1/16.
 */
/* jshint node: true */
/* jshint esnext: true */
'use strict';

process.env.NODE_ENV = "test";
const config = require('../config/index');

// Set up testing modules
const expect = require('chai').expect;

// Import accessory modules
const mongoose = require('mongoose');
const mongooseDAO = require('../lib/db/mongo.controller');
const frameModel = require('../lib/frame/frame.model');

// Import to test
const createRound = require('../lib/utils/frame.createRound');
const nextPlayerUp = require('../lib/utils/frame.nextPlayerUp');

describe('nextPlayerUp', () => {
  let number = new mongoose.Types.ObjectId;
  let players = ['Dude','Walter','Donny'];

  before( (done)=> {
    mongooseDAO.connect(config.mongo.uri, config.mongo.options);
    mongooseDAO.removeAll('frameModel');
    createRound(players,1,number)
        .then( (_res) => {
          done()
        })
  });

  it('should be a function', () =>{
    expect(nextPlayerUp).to.be.an.instanceOf(Function);
  });
  it('should return the first player for a game just created if game number given', (done) => {
    let playerOrder;
    frameModel.find( {gameNumber: number} ).sort({order:1})
        .then((frameResults) => {
          playerOrder = frameResults;
        })
        .then( () => {
          return nextPlayerUp(number)
        })
        .then((res) => {
          expect(res).to.eq(playerOrder[0].player);
          done();
        })
        .catch((err) => {
          throw Error("Whoops", err);
          done();
        });
  });
  it('should return the first player for a game just created if game and frame number are given', (done) => {
    let playerOrder;
    frameModel.find( {gameNumber: number} ).sort({order:1})
        .then((frameResults) => {
          playerOrder = frameResults;
        })
        .then( () => {
          return nextPlayerUp(number, 1)
        })
        .then((res) => {
          expect(res).to.eq(playerOrder[0].player);
          done();
        })
        .catch((err) => {
          throw Error("Whoops", err);
          done();
        });
  });
  it('should return the first player for a game just created if game number, frame number and player are given', (done) => {
    let playerOrder;
    frameModel.find( {gameNumber: number} ).sort({order:1})
        .then((frameResults) => {
          playerOrder = frameResults;
        })
        .then( () => {
          return nextPlayerUp(number, 1, playerOrder[0])
        })
        .then((res) => {
          expect(res).to.eq(playerOrder[0].player);
          done();
        })
        .catch((err) => {
          throw Error("Whoops", err);
          done();
        });
  });
  it('should return the second player when the first is finished', (done) => {
    let playerOrder;
    frameModel.find( {gameNumber: number} ).sort({order:1})
        .then((frameResults) => {
          playerOrder = frameResults;
          return frameModel.update({_id: playerOrder[0]._id},{'$set': {finished: true}})
        })
        .then( () => {
          return nextPlayerUp(number)
        })
        .then((res) => {
          expect(res).to.eq(playerOrder[1].player);
          done();
        })
        .catch((err) => {
          throw Error("Whoops", err);
          done();
        });
  });
  it('should return the second player when the first is finished if game and frame number are given', (done) => {
    let playerOrder;
    frameModel.find( {gameNumber: number} ).sort({order:1})
        .then((frameResults) => {
          playerOrder = frameResults;
          return frameModel.update({_id: playerOrder[0]._id},{'$set': {finished: true}})
        })
        .then( () => {
          return nextPlayerUp(number, 1)
        })
        .then((res) => {
          expect(res).to.eq(playerOrder[1].player);
          done();
        })
        .catch((err) => {
          throw Error("Whoops", err);
          done();
        });
  });
  it('should return the second player when the first is finished if game number, frame number and player are given', (done) => {
    let playerOrder;
    frameModel.find( {gameNumber: number} ).sort({order:1})
        .then((frameResults) => {
          playerOrder = frameResults;
          return frameModel.update({_id: playerOrder[0]._id},{'$set': {finished: true}})
        })
        .then( () => {
          return nextPlayerUp(number, 1, playerOrder[0])
        })
        .then((res) => {
          expect(res).to.eq(playerOrder[1].player);
          done();
        })
        .catch((err) => {
          throw Error("Whoops", err);
          done();
        });
  });
  it('should return null when all players are finished', (done) => {
    let playerOrder;
    frameModel.find( {gameNumber: number} ).sort({order:1})
        .then((frameResults) => {
          playerOrder = frameResults;
          return frameModel.update({_id: playerOrder[0]._id},{'$set': {finished: true}})
        })
        .then( () => {
          return nextPlayerUp(number)
        })
        .then((res) => {
          expect(res).to.eq(playerOrder[1].player);
          done();
        })
        .catch((err) => {
          throw Error("Whoops", err);
          done();
        });
  });

  after( () => {
    mongooseDAO.removeAll('frameModel');
    mongooseDAO.disconnect();
  })
});
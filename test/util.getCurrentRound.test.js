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
const getCurrentRound = require('../lib/utils/frame.getCurrentRound');

describe('getCurrentRound', () => {
  let number = new mongoose.Types.ObjectId;
  let players = ['Dude','Walter','Donny'];

  before( (done)=> {
    mongooseDAO.connect(config.mongo.uri, config.mongo.options);
    mongooseDAO.removeAll('frameModel');
    createRound(players,1,number)
        .then( (_res) => { done() })
  });

  it('should be a function', () =>{
    expect(getCurrentRound).to.be.an.instanceOf(Function);
  });
  it('should return 1 for a game just created', (done) => {
    getCurrentRound(number)
        .then((res) => {
          expect(res).to.eq(1);
          done();
        })
        .catch((err) => {
          throw Error("Whoops", err);
          done();
        });
  });
  it('should return 2 for a game where round 1 is all finished', (done) => {
    frameModel.update({gameNumber: number},{'$set': {finished: true}}, {multi:true})
        .then( (_res) => {
          return getCurrentRound(number)
        })
        .then((res) => {
          expect(res).to.eq(2);
          done();
        })
        .catch((err) => {
          throw Error("Whoops", err.message);
          done();
        });
  });
  it('should return 0 for a game where round 10 is all finished', (done) => {
    createRound(players,10,number)
        .then((_res) => {
          return frameModel.update({gameNumber: number, frameNumber: 10}, {'$set': {finished: true}}, {multi: true})
        })
        .then( (_res) => {
          return getCurrentRound(number)
        })
        .then((res) => {
          expect(res).to.eq(0);
          done();
        })
        .catch((err) => {
          throw Error("Whoops", err.message);
          done();
        });
  });

  after( () => {
    mongooseDAO.removeAll('frameModel');
    mongooseDAO.disconnect();
  })
});

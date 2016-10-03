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
const getCurrentPlayer = require('../lib/utils/frame.getCurrentPlayer');

describe('getCurrentPlayer', () => {
  var number = new mongoose.Types.ObjectId;

  before( ()=> {
    mongooseDAO.connect(config.mongo.uri, config.mongo.options);
  });

  beforeEach( ()=> {
    mongooseDAO.removeAll('frameModel')
  });

  it('should be a function', () =>{
    expect(getCurrentPlayer).to.be.an.instanceOf(Function);
  });
  it('should return the lowest ordered unfinished frame: first player for a new game', (done) => {
    createRound(['Leibowitz', 'Chrome', 'Flatline'])
        .then((gameInfo) => {
          return getCurrentPlayer(gameInfo.gameNumber)
        })
        .then((res) => {
          expect(res.frameNumber).to.eq(1);
          expect(res.player).to.eq("Leibowitz");
          done()
        })
        .catch((err) => {
          throw Error("Whoops", err);
          done();
        });
  });

  it('should return the lowest ordered unfinished frame', (done) => {
    var array = [
      { "order" : 0, "nextPlayer" : "Kara", "gameNumber" : number, "player" : "Walker", "rolls" : [ 1, 3 ], "finished" : true, "frameNumber" : 1, "__v" : 0 },
      { "order" : 0, "nextPlayer" : "Kara", "gameNumber" : number, "player" : "Walker", "rolls" : [ 3, 4 ], "finished" : true, "frameNumber" : 2, "__v" : 0 },
      { "order" : 0, "nextPlayer" : "Kara", "gameNumber" : number, "player" : "Walker", "rolls" : [ 9 ], "finished" : false, "frameNumber" : 3, "__v" : 0 },
      { "order" : 1, "nextPlayer" : [ "Walker", "Kara" ], "gameNumber" : number, "player" : "Kara", "rolls" : [ 1, 1 ], "finished" : true, "frameNumber" : 1, "__v" : 0 },
      { "order" : 1, "nextPlayer" : [ "Walker", "Kara" ], "gameNumber" : number, "player" : "Kara", "rolls" : [ 1, 1 ], "finished" : true, "frameNumber" : 2, "__v" : 0 },
      { "order" : 1, "nextPlayer" : [ "Walker", "Kara" ], "gameNumber" : number, "player" : "Kara", "rolls" : [ ], "finished" : false, "frameNumber" : 3, "__v" : 0 },
    ];
    frameModel.create(array)
        .then(() => {
          return getCurrentPlayer(number)
        })
        .then((res) => {
          expect(res.frameNumber).to.eq(3);
          expect(res.player).to.eq("Walker");
          done()
        })
        .catch((err) => {
          throw Error("Whoops", err);
          done();
        });
  });

  it('should return false if all players are finished', (done) => {
    var array = [
      { "order" : 0, "nextPlayer" : "Kara", "gameNumber" : number, "player" : "Walker", "rolls" : [ 1, 3 ], "finished" : true, "frameNumber" : 1, "__v" : 0 },
      { "order" : 0, "nextPlayer" : "Kara", "gameNumber" : number, "player" : "Walker", "rolls" : [ 3, 4 ], "finished" : true, "frameNumber" : 2, "__v" : 0 },
      { "order" : 0, "nextPlayer" : "Kara", "gameNumber" : number, "player" : "Walker", "rolls" : [ 10 ], "finished" : true, "frameNumber" : 3, "__v" : 0 },
      { "order" : 1, "nextPlayer" : [ "Walker", "Kara" ], "gameNumber" : number, "player" : "Kara", "rolls" : [ 1, 1 ], "finished" : true, "frameNumber" : 1, "__v" : 0 },
      { "order" : 1, "nextPlayer" : [ "Walker", "Kara" ], "gameNumber" : number, "player" : "Kara", "rolls" : [ 1, 1 ], "finished" : true, "frameNumber" : 2, "__v" : 0 },
      { "order" : 1, "nextPlayer" : [ "Walker", "Kara" ], "gameNumber" : number, "player" : "Kara", "rolls" : [ 2, 3 ], "finished" : true, "frameNumber" : 3, "__v" : 0 },
    ];
    frameModel.create(array)
        .then(() => {
          return getCurrentPlayer(number)
        })
        .then((res) => {
          expect(res).to.eql(false);
          done()
        })
        .catch((err) => {
          throw Error("Whoops", err);
          done();
        });
  });

  afterEach( () => {
    mongooseDAO.removeAll('frameModel');
  })

  after(() => {
    mongooseDAO.disconnect();
  })
});
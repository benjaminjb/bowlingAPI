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

// Import to test
const createOrUpdateFrame = require('../lib/utils/frame.createOrUpdate');
const createRound = require('../lib/utils/frame.createRound');
const createGame = require('../lib/utils/game.create');

describe('createOrUpdateFrame', () => {
  var number = new mongoose.Types.ObjectId;

  before( ()=> {
    mongooseDAO.connect(config.mongo.uri, config.mongo.options);
    mongooseDAO.removeAll('frameModel');
  });

  it('should be a function', () =>{
    expect(createOrUpdateFrame).to.be.an.instanceOf(Function);
  });
  it('should create a frame if no frame exists', (done) => {
    var frame = {
      gameNumber: number,
      player: "Brett",
      nextPlayer: "Damocles",
      frameNumber: 1
    };
    createOrUpdateFrame(frame)
      .then((res) => {
        mongooseDAO.find('frameModel')
          .then((finding) => {
            expect(finding.length).to.eq(1);
            expect(finding[0].player).to.eq("Brett");
            done();
          });
      })
      .catch((err) => {
        throw Error("Whoops", err);
        done();
      });
  });
  it('should update a frame if the frame exists', (done) => {
    var frame = {
      gameNumber: number,
      player: "Brett",
      nextPlayer: "Damocles",
      frameNumber: 1,
      rolls: 4
    };
    createOrUpdateFrame(frame)
        .then((res) => {
          mongooseDAO.find('frameModel')
              .then((finding) => {
                expect(finding.length).to.eq(1);
                expect(finding[0].player).to.eq("Brett");
                expect(finding[0].rolls.length).to.eq(1);
                expect(finding[0].rolls[0]).to.eq(4);
                done();
              });
        })
        .catch((err) => {
          throw Error("Whoops", err);
          done();
        });
  });
  it('should update a frame if the frame exists, part two: checking out rolls.push', (done) => {
    var frame = {
      gameNumber: number,
      player: "Brett",
      nextPlayer: "Damocles",
      frameNumber: 1,
      rolls: 3,
      finished: true
    };
    createOrUpdateFrame(frame)
        .then((res) => {
          mongooseDAO.find('frameModel')
              .then((finding) => {
                expect(finding.length).to.eq(1);
                expect(finding[0].player).to.eq("Brett");
                expect(finding[0].rolls.length).to.eq(2);
                expect(finding[0].rolls[0]).to.eq(4);
                expect(finding[0].rolls[1]).to.eq(3);
                expect(finding[0].finished).to.eq(true);
                done();
              });
        })
        .catch((err) => {
          throw Error("Whoops", err);
          done();
        });
  });
  it('should create a second frame', (done) => {
    var frame = {
      gameNumber: number,
      player: "Brett",
      nextPlayer: "Damocles",
      frameNumber: 2,
    };
    createOrUpdateFrame(frame)
        .then((res) => {
          mongooseDAO.find('frameModel')
              .then((finding) => {
                expect(finding.length).to.eq(2);
                expect(finding[0].player).to.eq("Brett");
                expect(finding[1].player).to.eq("Brett");
                expect(finding[0].frameNumber).to.exist;
                expect(finding[1].frameNumber).to.exist;
                expect(finding[0].frameNumber).to.be.above(0);
                expect(finding[1].frameNumber).to.be.above(0);
                done();
              });
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

describe('createRound', () => {
  var number = new mongoose.Types.ObjectId;

  before( ()=> {
    mongooseDAO.connect(config.mongo.uri, config.mongo.options);
    mongooseDAO.removeAll('frameModel');
  });

  it('should be a function', () =>{
    expect(createRound).to.be.an.instanceOf(Function);
  });
  it('should create a round if there are players', (done) => {
    let players = ['Dude','Walter','Donny'];

    createRound(players)
        .then((res) => {
          mongooseDAO.find('frameModel')
              .then((finding) => {
                expect(finding.length).to.eq(3);
                let playersNames = [];
                let nextPlayerNames = [];
                let frameNumbers = [];
                let gameNumbers  = [];
                finding.forEach( (player) => {
                  playersNames.push(player.player);
                  nextPlayerNames.push(player.nextPlayer);
                  if (frameNumbers.indexOf(player.frameNumber)==-1) {
                    frameNumbers.push(player.frameNumber);
                  };
                  if (gameNumbers.indexOf(player.gameNumber.toString())==-1) {
                    gameNumbers.push(player.gameNumber.toString());
                  }
                });

                expect(playersNames).to.include("Dude");
                expect(playersNames).to.include("Walter");
                expect(playersNames).to.include("Donny");

                expect(nextPlayerNames).to.include("Dude");
                expect(nextPlayerNames).to.include("Walter");
                expect(nextPlayerNames).to.include("Donny");

                expect(frameNumbers.length).to.eq(1);
                expect(frameNumbers[0]).to.eq(1);

                expect(gameNumbers.length).to.eq(1);
                done();
              });
        })
        .catch((err) => {
          throw Error("Whoops", err);
          done();
        });
  });
  it('shouldn\'t create a round if there aren\'t players', (done) => {
    let players = [];

    createRound(players)
      .then((res) => {
        throw new Error('We shouldn\'t be here',res);
        done()
      })
      .catch((err) => {
        expect(err).to.exist;
        expect(err.message).to.eq("Need an array of 1 to 12 players");
        done();
      });
  });
  it('should create a round of any frame and gameNumber', (done) => {
    let players = ['Dude','Walter','Donny'];

    createRound(players, 2, number)
        .then((res) => {
          mongooseDAO.find('frameModel', {frameNumber:2})
              .then((finding) => {
                expect(finding.length).to.eq(3);
                let playersNames = [];
                let nextPlayerNames = [];
                let frameNumbers = [];
                let gameNumbers  = [];
                finding.forEach( (player) => {
                  playersNames.push(player.player);
                  nextPlayerNames.push(player.nextPlayer);
                  if (frameNumbers.indexOf(player.frameNumber)==-1) {
                    frameNumbers.push(player.frameNumber);
                  };
                  if (gameNumbers.indexOf(player.gameNumber.toString())==-1) {
                    gameNumbers.push(player.gameNumber.toString());
                  }
                });

                expect(playersNames).to.include("Dude");
                expect(playersNames).to.include("Walter");
                expect(playersNames).to.include("Donny");

                expect(nextPlayerNames).to.include("Dude");
                expect(nextPlayerNames).to.include("Walter");
                expect(nextPlayerNames).to.include("Donny");

                expect(frameNumbers.length).to.eq(1);
                expect(frameNumbers[0]).to.eq(2);

                expect(gameNumbers.length).to.eq(1);
                expect(gameNumbers[0]).to.eq(number.toString());
                done();
              });
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
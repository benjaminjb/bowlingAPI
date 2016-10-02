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

xdescribe('createOrUpdateFrame', () => {
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
                console.log("!!!!!!!"+finding);
                expect(finding.length).to.eq(3);
                let names = finding.each( (player) => {
                  return player.player;
                });
                expect(names).to.include("Dude");
                expect(names).to.include("Walter");
                expect(names).to.include("Donny");
                done();
              });
        })
        .catch((err) => {
          throw Error("Whoops", err);
          done();
        });
  });
  xit('should update a frame if the frame exists', (done) => {
    var frame = {
      gameNumber: number,
      player: "Brett",
      nextPlayer: "Damocles",
      frameNumber: 1,
      rolls: 4
    };
    createRound(frame)
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
  xit('should update a frame if the frame exists, part two: checking out rolls.push', (done) => {
    var frame = {
      gameNumber: number,
      player: "Brett",
      nextPlayer: "Damocles",
      frameNumber: 1,
      rolls: 3,
      finished: true
    };
    createRound(frame)
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
  xit('should create a second frame', (done) => {
    var frame = {
      gameNumber: number,
      player: "Brett",
      nextPlayer: "Damocles",
      frameNumber: 2,
    };
    createRound(frame)
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
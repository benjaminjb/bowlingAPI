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
const getCurrentRound = require('../lib/utils/frame.getCurrentRound');
const nextPlayerUp = require('../lib/utils/frame.nextPlayerUp');

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
                let nextPlayerNamesArray = null;
                let frameNumbers = [];
                let gameNumbers  = [];
                finding.forEach( (player) => {
                  playersNames.push(player.player);
                  if (typeof (player.nextPlayer) === "string") {
                    nextPlayerNames.push(player.nextPlayer);
                  }
                  if (Array.isArray(player.nextPlayer)) {
                    nextPlayerNamesArray = player.nextPlayer;
                  }
                  if (frameNumbers.indexOf(player.frameNumber)==-1) {
                    frameNumbers.push(player.frameNumber);
                  }
                  if (gameNumbers.indexOf(player.gameNumber.toString())==-1) {
                    gameNumbers.push(player.gameNumber.toString());
                  }
                });

                expect(playersNames).to.include("Dude");
                expect(playersNames).to.include("Walter");
                expect(playersNames).to.include("Donny");

                expect(nextPlayerNamesArray).to.deep.eq(["Dude","Walter","Donny"]);
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
  it('should create a round of any frame and gameNumber', (done) => {
    let players = ['Dude','Walter','Donny'];

    createRound(players, 2, number)
        .then((res) => {
          mongooseDAO.find('frameModel', {frameNumber:2})
              .then((finding) => {
                expect(finding.length).to.eq(3);
                let playersNames = [];
                let nextPlayerNames = [];
                let nextPlayerNamesArray = null;
                let frameNumbers = [];
                let gameNumbers  = [];
                finding.forEach( (player) => {
                  playersNames.push(player.player);
                  if (typeof (player.nextPlayer) === "string") {
                    nextPlayerNames.push(player.nextPlayer);
                  }
                  if (Array.isArray(player.nextPlayer)) {
                    nextPlayerNamesArray = player.nextPlayer;
                  }
                  if (frameNumbers.indexOf(player.frameNumber)==-1) {
                    frameNumbers.push(player.frameNumber);
                  }
                  if (gameNumbers.indexOf(player.gameNumber.toString())==-1) {
                    gameNumbers.push(player.gameNumber.toString());
                  }
                });

                expect(playersNames).to.include("Dude");
                expect(playersNames).to.include("Walter");
                expect(playersNames).to.include("Donny");

                expect(nextPlayerNamesArray).to.deep.eq(["Dude","Walter","Donny"]);
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
  it('shouldn\'t create a round if given an empty array', (done) => {
    createRound([])
      .then((res) => {
        throw new Error('Shouldn\'t be here', res);
        done()
      })
      .catch((err) => {
        expect(err).to.exist;
        expect(err.message).to.eq("Need an array of 1 to 12 players");
        done();
      });
  });
  it('shouldn\'t create a round if there aren\'t players given', (done) => {
    createRound()
        .then((res) => {
          throw new Error('Shouldn\'t be here', res);
          done()
        })
        .catch((err) => {
          expect(err).to.exist;
          expect(err.message).to.eq("Need an array of players");
          done();
        });
  });

  after( () => {
    mongooseDAO.removeAll('frameModel');
    mongooseDAO.disconnect();
  })
});

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
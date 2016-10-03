/**
 * Created by benjaminblattberg on 10/3/16.
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
const createRound = require('../lib/utils/frame.createRound');

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

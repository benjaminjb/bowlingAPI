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
const mongooseDAO = require('../lib/db/mongo.controller');
const frameModel = require('../lib/frame/frame.model');

// Import to test
const createRound = require('../lib/utils/frame.createRound');
const getPlayers = require('../lib/utils/frame.getPlayers');

describe('getPlayers', () => {

  before( ()=> {
    mongooseDAO.connect(config.mongo.uri, config.mongo.options);
    mongooseDAO.removeAll('frameModel')
  });

  it('should be a function', () =>{
    expect(getPlayers).to.be.an.instanceOf(Function);
  });
  it('should return the players for a game', (done) => {
    createRound(['Dude', 'Walter', 'Donny'])
        .then((gameInfo) => {
          return getPlayers(gameInfo.gameNumber)
        })
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
          done()
        })
        .catch((err) => {
          throw Error("Whoops", err);
          done();
        });
  });

  after(() => {
    mongooseDAO.removeAll('frameModel');
    mongooseDAO.disconnect();
  })
});

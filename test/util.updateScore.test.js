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
const updateScore = require('../lib/utils/frame.updateScore');
const frameModel = require('../lib/frame/frame.model');

describe('updateScore', () => {
  before( ()=> {
    mongooseDAO.connect(config.mongo.uri, config.mongo.options);
    mongooseDAO.removeAll('frameModel');
  });

  it('should be a function', () =>{
    expect(updateScore).to.be.an.instanceOf(Function);
  });
  it('should update a round', (done) => {
    let players = ['Dude'];
    let getInfo, playerDoc;

    createRound(players)
      .then((res) => {
          getInfo = res.gameNumber;
          return mongooseDAO.findOne('frameModel', {player: 'Dude'})
      })
      .then((finding) => {
        playerDoc = finding;
        return updateScore(playerDoc, {rolls: 5})
      })
      .then((updatedPlayer) => {
        expect(updatedPlayer.player).to.eq('Dude');
        expect(updatedPlayer.rolls[0]).to.eq(5);
      })
      .then(() => {
        return mongooseDAO.findOne('frameModel', {player: 'Dude'})
      })
      .then((found2) => {
        expect(found2.player).to.eq('Dude');
        expect(found2.rolls[0]).to.eq(5);
      })
      .then(() => {
        return updateScore(playerDoc, {rolls: 3})
      })
      .then((updatedPlayer) => {
        expect(updatedPlayer.player).to.eq('Dude');
        expect(updatedPlayer.rolls[0]).to.eq(5);
        expect(updatedPlayer.rolls[1]).to.eq(3);
        expect(updatedPlayer.finished).to.eq(true);
      })
      .then(() => {
        return mongooseDAO.findOne('frameModel', {player: 'Dude'})
      })
      .then((found3) => {
        expect(found3.player).to.eq('Dude');
        expect(found3.rolls[0]).to.eq(5);
        expect(found3.rolls[1]).to.eq(3);
        expect(found3.finished).to.eq(true);
        done();
      })
      .catch((err) => {
        throw Error("Whoops", err);
        done();
      });
  });
  it('should update a round and create a new one if spare', (done) => {
    let players = ['Donny'];
    let getInfo, playerDoc, id;

    createRound(players)
        .then((res) => {
          getInfo = res.gameNumber;
          return mongooseDAO.findOne('frameModel', {player: 'Donny'})
        })
        .then((finding) => {
          playerDoc = finding;
          return updateScore(playerDoc, {rolls: 5}, true)
        })
        .then(() => {
          return updateScore(playerDoc, {rolls: 5}, true)
        })
        .then(() => {
          return mongooseDAO.findAndOrder('frameModel', {player:'Donny'},{frameNumber:1})
        })
        .then((frames) => {
          let frame1 = frames[0];
          let frame2 = frames[1];

          id = frame1._id;
          expect(frame1.player).to.eq('Donny');
          expect(frame1.rolls[0]).to.eq(5);
          expect(frame1.rolls[1]).to.eq(5);
          expect(frame1.finished).to.eq(true);
          expect(frame1.special).to.eq('spare');

          expect(frame2.player).to.eq('Donny');
          expect(frame2.rolls.length).to.eq(1);
          expect(frame2.rolls[0]).to.eql(id);
          expect(frame2.finished).to.eq(false);
          done();
        })
        .catch((err) => {
          console.log(err)
          throw Error("Whoops", err);
          done();
        });
  });

  after( () => {
    mongooseDAO.removeAll('frameModel');
    mongooseDAO.disconnect();
  })
});

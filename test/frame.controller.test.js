/**
 * Created by benjaminblattberg on 10/1/16.
 */
/* jshint node: true */
/* jshint esnext: true */
'use strict';

// Import to test frame routes
process.env.NODE_ENV = "test";
const config = require('../config/index');
const server = require('../server/app');

// Set up testing modules
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const expect = chai.expect;

// Set up DB direct testing
const Promise = require('bluebird');
const mongoose = require('mongoose');
mongoose.Promise = Promise;
const frameModel = require('../lib/frame/frame.model');
const mongooseDAO = require('../lib/db/mongo.controller');

// Add additional helper functions
const createRound = require('../lib/utils/frame.createRound');
const getCurrentRound = require('../lib/utils/frame.getCurrentRound');
const nextPlayerUp = require('../lib/utils/frame.nextPlayerUp');


describe('Controller/Routes: post /game route and createGame', function () {
  before( ()=> {
    mongooseDAO.removeAll('frameModel');
  });
  it("should create a game if given players", function (done) {
    chai.request(server)
        .post('/game')
        .set('Content-Type', 'application/json')
        .send({players: ["Wil", "Wheaton"]})
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res.body.status).to.eq(1);
          expect(res.body.data.players.length).to.eq(2);
          expect(res.body.data.gameNumber).to.exist;
          expect(res.body.data.round).to.eq(1);
          expect(res.body.data.nextPlayer).to.eq('Wil');
          done();
        })
        .catch(function (err) {
          throw err;
          done();
        })
  });
  it("shouldn\'t create a game if not given players", function (done) {
    chai.request(server)
        .post('/game')
        .set('Content-Type', 'application/json')
        .send({players: []})
        .then(function (res) {
          throw new Error("Whoops",res);
          done();
        })
        .catch(function (err) {
          expect(err).to.have.status(400);
          expect(err.response.body.status).to.eq(0);
          expect(err.response.body.error).to.eq('Need an array of 1 to 12 players');
          done();
        })
  });
  after( () => {
    mongooseDAO.removeAll('frameModel');
    server.close();
  })
});

describe('Controller/Routes: get /game/:game_id route and getGameInfo', function () {
  var number = new mongoose.Types.ObjectId;
  before( (done)=> {
    mongooseDAO.removeAll('frameModel');
    done();
  });
  it("should return info about the game", function (done) {
    var array = [
      { "order" : 0, "nextPlayer" : "Kara", "gameNumber" : number, "player" : "Walker", "rolls" : [ 1, 3 ], "finished" : true, "frameNumber" : 1, "__v" : 0 },
      { "order" : 0, "nextPlayer" : "Kara", "gameNumber" : number, "player" : "Walker", "rolls" : [ 3, 4 ], "finished" : true, "frameNumber" : 2, "__v" : 0 },
      { "order" : 0, "nextPlayer" : "Kara", "gameNumber" : number, "player" : "Walker", "rolls" : [ 9 ], "finished" : false, "frameNumber" : 3, "__v" : 0 },
      { "order" : 1, "nextPlayer" : [ "Walker", "Kara" ], "gameNumber" : number, "player" : "Kara", "rolls" : [ 1, 1 ], "finished" : true, "frameNumber" : 1, "__v" : 0 },
      { "order" : 1, "nextPlayer" : [ "Walker", "Kara" ], "gameNumber" : number, "player" : "Kara", "rolls" : [ 1, 1 ], "finished" : true, "frameNumber" : 2, "__v" : 0 },
      { "order" : 1, "nextPlayer" : [ "Walker", "Kara" ], "gameNumber" : number, "player" : "Kara", "rolls" : [ 2 ], "finished" : false, "frameNumber" : 3, "__v" : 0 },
    ];
    frameModel.create(array)
    .then(() => {
          chai.request(server)
              .get('/game/' + number)
              .set('Content-Type', 'application/json')
              .then((res) => {
                expect(res).to.have.status(200);
                expect(res.body.status).to.eq(1);
                expect(res.body.data.frameResults[1]).to.eql([
                  { rolls: [ 1, 3 ], player: 'Walker', frameNumber: 1, score: 4 },
                  { rolls: [ 1, 1 ], player: 'Kara', frameNumber: 1, score: 2 }
                ]);
                expect(res.body.data.frameResults[2]).to.eql([
                  { rolls: [ 3, 4 ], player: 'Walker', frameNumber: 2, score: 7 },
                  { rolls: [ 1, 1 ], player: 'Kara', frameNumber: 2, score: 2 }
                ]);
                expect(res.body.data.frameResults[3]).to.eql([
                  { rolls: [ 9 ], player: 'Walker', frameNumber: 3, score: 9 },
                  { rolls: [ 2 ], player: 'Kara', frameNumber: 3, score: 2 }
                ]);
                expect(res.body.data.totalScores[0]).to.eql({ player: 'Walker', score: 20 })
                expect(res.body.data.totalScores[1]).to.eql({ player: 'Kara', score: 6 })
                done();
              })
              .catch((err) => {
                throw err;
                done();
              })
     })
  });
  after( () => {
    mongooseDAO.removeAll('frameModel');
    server.close();
  })
});

xdescribe('Controller/Routes: put /game route and updateFrame', function () {
  var number = new mongoose.Types.ObjectId;
  before( ()=> {
    mongooseDAO.removeAll('frameModel');
  });
  it("should update a frame", function (done) {
    createRound(["Rand", "Wayne"], 1, number)
    .then(() => {
      chai.request(server)
      .put('/game/' + number)
      .set('Content-Type', 'application/json')
      .send({rolls: 3})
      .then( (res) => {
        expect(res).to.have.status(200);
        expect(res.body.status).to.eq(1);
        expect(res.body.data.player).to.eq('Rand');
        expect(res.body.data.rolls[0]).to.eq(3);
        done();
      })
    })
    .then(() => {
          chai.request(server)
              .put('/game/' + number)
              .set('Content-Type', 'application/json')
              .send({rolls: 4})
              .then(function (res) {
                console.log('res', res.body)
                //expect(res).to.have.status(200);
                //expect(res.body.status).to.eq(1);
                //expect(res.body.data.player).to.eq('Rand');
                //expect(res.body.data.rolls[0]).to.eq(3);
                //expect(res.body.data.rolls[1]).to.eq(4);
                done();
              })
        })

              .catch(function (err) {
                console.log('!!!!!!!!!!err',err)
                //throw err;
                done();
              })



  });
  after( () => {
    //mongooseDAO.removeAll('frameModel');
    server.close();
  })
});
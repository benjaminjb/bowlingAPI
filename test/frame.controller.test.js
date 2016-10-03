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
const createOrUpdateFrame = require('../lib/utils/frame.createOrUpdate');
const createRound = require('../lib/utils/frame.createRound');
const getCurrentFrame = require('../lib/utils/frame.getCurrent');
const nextPlayerUp = require('../lib/utils/frame.nextPlayerUp');


xdescribe('Controller/Routes: post /game route and createGame', function () {
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
          expect(res.body.data.length).to.eq(2);
          expect(res.body.data[0].player).to.be.oneOf(['Wil', 'Wheaton']);
          expect(res.body.data[1].player).to.be.oneOf(['Wil', 'Wheaton']);
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

xdescribe('Controller/Routes: get /round/:game_id route and getCurrentRound', function () {
  var number = new mongoose.Types.ObjectId;
  before( (done)=> {
    mongooseDAO.removeAll('frameModel');
    done();
  });
  it("should return the current round of a game", function (done) {
    createRound(["Luke", "Jessica"], 1, number)
    .then(() => {
      return frameModel.update({gameNumber: number},{'$set': {finished: true}}, {multi:true});
    })
    .then(() =>{
      return createRound(["Luke", "Jessica"], 2, number);
    })
    .then(() => {
      chai.request(server)
        .get('/round/' + number)
        .set('Content-Type', 'application/json')
        .then((res) => {
          console.log(res.body)
          expect(res).to.have.status(200);
          expect(res.body.status).to.eq(1);
          //expect(res.body.data).to.eq(2);
          done();
        })
        .catch((err) => {
          throw err;
          done();
        })
    })
  });
  after( () => {
    //mongooseDAO.removeAll('frameModel');
    server.close();
  })
});

describe('Controller/Routes: put /game route and updateFrame', function () {
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
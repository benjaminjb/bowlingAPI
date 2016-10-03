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
  })
});

//  before(function () {
//    server.listen(config.port);
//    api = supertest(server);
//  });
//
//  it('should create a game if given players', function (done){
//    console.log('hey')
//done()

    //api.post('http://localhost:9000/game')
    //    .set('Content-Type', 'application/json')
    //    .send({
    //      "players": ["Wil", "Wheaton"]
    //    })
    //    .end(function(err,res){
          //      // HTTP status should be 200
          //      res.status.should.equal(200);
          //      // Error key should be false.
          //      res.body.error.should.equal(false);
          //console.log('err', err, 'res', res)
          //      done();
          //    });



    //api.post('/game')
    //    .set('Content-Type', 'application/json')
    //    //.set('Authorization', 'Bearer '+config.TEST_JWT)
    //    .send({
    //      "players": ["Wil", "Wheaton"]
    //    })
    //it("should return home page",function(done){

      // calling home page api
      //server
      //    .get("/")
      //    .expect("Content-type",/json/)
      //    .expect(200) // THis is HTTP response
      //    .end(function(err,res){
      //      // HTTP status should be 200
      //      res.status.should.equal(200);
      //      // Error key should be false.
      //      res.body.error.should.equal(false);
      //      done();
      //    });

        //.end(function (err, res) {
        //  //expect(err).to.not.exist;
        //  expect(res.body.status).to.equal(1);
        //  expect(res.body.data).to.exist;
        //  console.log(res.body.data);

          //[ { __v: 0,
          //  order: 0,
          //  nextPlayer: 'Wheaton',
          //  gameNumber: '57f1a4628e06a54b12ac8da3',
          //  player: 'Wil',
          //  _id: '57f1a4628e06a54b12ac8da4',
          //  rolls: [],
          //  finished: false,
          //  frameNumber: 1 },
          //  { __v: 0,
          //    order: 1,
          //    nextPlayer: [ 'Wil', 'Wheaton' ],
          //    gameNumber: '57f1a4628e06a54b12ac8da3',
          //    player: 'Wheaton',
          //    _id: '57f1a4628e06a54b12ac8da5',
          //    rolls: [],
          //    finished: false,
          //    frameNumber: 1 } ]
          //done();
        //});
//  });
//  afterEach(function () {
//    server.close();
//  });
//});

//xdescribe('Unisoft MVR Endpoint - Caching and Retrieval Test', function (done){
//  beforeEach(function (done) {
//    Promise.all( [
//      MVR.remove( { 'json.LICENSE' : 'M635200808730' }),
//      MVR.remove( { 'json.LICENSE' : 'P626816897030' })
//    ] )
//        .then( (returns) => {
//          server.listen(test_port);
//          sinon.spy(cacheLayer, "cache");
//          sinon.spy(cacheLayer, "retrieve");
//          done();
//        })
//        .catch ( (err) => {
//      console.log('Before hook error', err);
//      throw Error(err);
//    });
//  });
//
//  this.timeout(config.TEST_TIMEOUT);
//
//  it('should attempt to retrieve the MVR, request if necessary, and cache it', function (done){
//
//    // The DB should NOT have an entry with that license
//    MVR.find({'json.LICENSE': 'P626816897030'})
//        .then( (resp6) => {
//          expect(resp6.length).to.equal(0);
//
//          api.post('/Unisoft/MVR')
//              .timeout(config.TEST_TIMEOUT)
//              .set('Content-Type', 'application/json')
//              .set('Authorization', 'Bearer ' + config.TEST_JWT)
//              .send({
//                "insurance_company": "WIC",
//                "mvr_account": "6018",
//                "agent_code": "",
//                "drivers": [
//                  {"license_number": "P626816897030", "state": "FL"}
//                ]
//              })
//              .end(function (err, res) {
//
//                // Skip testing all the responses since other tests cover that material
//
//                // Testing the spies
//                // We attempted to retrieve and cache one element, so it should only be called once.
//                expect(cacheLayer.retrieve.calledOnce).to.equal(true);
//                expect(cacheLayer.retrieve.calledTwice).to.equal(false);
//                expect(cacheLayer.cache.calledOnce).to.equal(true);
//                expect(cacheLayer.cache.calledTwice).to.equal(false);
//
//                // We attempt to retrieve docs from the db with the given MVR info
//                expect(cacheLayer.retrieve.firstCall.args[0]).to.equal('mvr');
//                expect(cacheLayer.retrieve.firstCall.args[1]).to.deep.equal([{
//                  license_number: 'P626816897030',
//                  state: 'FL'
//                }]);
//                expect(cacheLayer.retrieve.returnValues[0]).to.eventually.deep.equal([]);
//
//                // We attempt to cache the docs into the db with the response info
//                expect(cacheLayer.cache.firstCall.args[0]).to.equal('mvr');
//                expect(cacheLayer.cache.firstCall.args[1]).to.deep.equal(res.body.data.json.RESPONSE.XMLMvrClassicInterface);
//
//                // Testing the DB directly
//                MVR.find({'json.LICENSE': 'P626816897030'})
//                    .then((resp6) => {
//                      // Now we have an entry in the DB for this material
//                      expect(resp6.length).to.equal(1);
//                      return MVR.find({'json.LICENSE': 'M635200808730'})
//                    })
//                    .then((resm6) => {
//                      // We still have no entry for this second license
//                      expect(resm6.length).to.equal(0);
//                      done();
//                    })
//                    .catch((err) => {
//                      console.error("Error:", err);
//                      throw Error(err);
//                    })
//              });
//        });
//  });
//
//  it('should cache only what it needs to cache', function (done){
//    // Hit the post once to make sure we have one entry cached
//    api.post('/Unisoft/MVR')
//        .timeout(config.TEST_TIMEOUT)
//        .set('Content-Type', 'application/json')
//        .set('Authorization', 'Bearer '+config.TEST_JWT)
//        .send({
//          "insurance_company": "WIC",
//          "mvr_account": "6018",
//          "agent_code": "",
//          "drivers": [
//            {"license_number":"P626816897030", "state":"FL"}
//          ]
//        })
//        .end(function (err, res) {
//
//          api.post('/Unisoft/MVR')
//              .timeout(config.TEST_TIMEOUT)
//              .set('Content-Type', 'application/json')
//              .set('Authorization', 'Bearer ' + config.TEST_JWT)
//              .send({
//                "insurance_company": "WIC",
//                "mvr_account": "6018",
//                "agent_code": "",
//                "drivers": [
//                  {"license_number": "P626816897030", "state": "FL"},
//                  {"license_number": "M635200808730", "state": "FL"}
//                ]
//              })
//              .end(function (err, res) {
//
//                // Testing the spies
//                expect(cacheLayer.retrieve.calledOnce).to.equal(false);
//                expect(cacheLayer.retrieve.calledTwice).to.equal(true);
//                expect(cacheLayer.retrieve.calledThrice).to.equal(false);
//                expect(cacheLayer.retrieve.firstCall.args[0]).to.equal('mvr');
//                expect(cacheLayer.retrieve.firstCall.args[1]).to.deep.equal([{
//                  license_number: 'P626816897030',
//                  state: 'FL'
//                }]);
//                expect(cacheLayer.retrieve.secondCall.args[0]).to.equal('mvr');
//                expect(cacheLayer.retrieve.secondCall.args[1]).to.deep.equal([{
//                  license_number: 'P626816897030',
//                  state: 'FL'
//                },{
//                  license_number: 'M635200808730',
//                  state: 'FL'
//                }]);
//                expect(cacheLayer.retrieve.returnValues[0]).to.eventually.deep.equal([]);
//                expect(cacheLayer.retrieve.returnValues[1]).to.eventually.have.length(1);
//
//                expect(cacheLayer.cache.calledOnce).to.equal(false);
//                expect(cacheLayer.cache.calledTwice).to.equal(true);
//                expect(cacheLayer.cache.calledThrice).to.equal(false);
//                expect(cacheLayer.cache.firstCall.args[0]).to.equal('mvr');
//                expect(cacheLayer.cache.firstCall.args[1]).to.deep.equal(res.body.data.json.RESPONSE.XMLMvrClassicInterface[0]);
//                expect(cacheLayer.cache.secondCall.args[0]).to.equal('mvr');
//                expect(cacheLayer.cache.secondCall.args[1]).to.deep.equal(res.body.data.json.RESPONSE.XMLMvrClassicInterface[1]);
//
//
//                // Testing the DB directly
//                MVR.find({'json.LICENSE': 'P626816897030'})
//                    .then((resp6) => {
//                      expect(resp6.length).to.equal(1);
//                      return MVR.find({'json.LICENSE': 'M635200808730'})
//                    })
//                    .then((resm6) => {
//                      expect(resm6.length).to.equal(1);
//                      done();
//                    })
//                    .catch((err) => {
//                      console.error("Error:", err);
//                      throw Error(err);
//                    })
//
//              });
//        });
//  });
//
//  afterEach(function (done) {
//    Promise.all( [
//      MVR.remove( { 'json.LICENSE' : 'M635200808730' }),
//      MVR.remove( { 'json.LICENSE' : 'P626816897030' })
//    ] )
//        .then( (returns) => {
//          server.close();
//          cacheLayer.cache.restore();
//          cacheLayer.retrieve.restore();
//          done();
//        })
//        .catch ( (err) => {
//      console.error('After hook error:', err);
//      throw Error(err);
//    });
//  });
//});
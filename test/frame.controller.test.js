/**
 * Created by benjaminblattberg on 10/1/16.
 */
/* jshint node: true */
/* jshint esnext: true */
'use strict';

// Set up testing modules
const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;
const sinon = require('sinon');

// Import to test frameModel
const Promise = require('bluebird');
const mongoose = require('mongoose');
mongoose.Promise = Promise;
const frameModel = require('../lib/frame/frame.model');

// Import to test frame routes
const supertest = require('supertest');
const config = require('../config/index');
const api = supertest('localhost:'+config.port);
const server = require('../server/app');


describe('The model for a frame', () => {
  it('should fail if there\'s no gameNumber', (done) => {
    var frame = new frameModel({
      player: "William",
      nextPlayer: "William"
    });
    frame.validate((err) => {
      expect(err.errors.gameNumber).to.exist;
      done();
    });
  });
  it('shouldn\'t accept non-ObjectIds as gameNumber', (done) => {
    var frame = new frameModel({
      gameNumber: "",
      player: "William",
      nextPlayer: "William"
    });
    frame.validate((err) => {
      expect(err.errors.gameNumber).to.exist;
      expect(err.errors.gameNumber.message).to.eq('Cast to ObjectID failed for value "" at path "gameNumber"');
      done();
    });
  });
  it('should accept only an ObjectId as gameNumber', (done) => {
    var frame = new frameModel({
      gameNumber: new mongoose.Types.ObjectId,
      player: "William",
      nextPlayer: "William"
    });
    frame.validate((err) => {
      expect(err).to.eq(null);
      done();
    });
  });

  it('shouldn\'t accept non-numbers as frameNumber', () => {
    var frame = new frameModel({
      gameNumber: new mongoose.Types.ObjectId,
      frameNumber: "hi",
      player: "William",
      nextPlayer: "William"
    });
    frame.validate((err) => {
      expect(err.errors.frameNumber).to.exist;
      expect(err.errors.frameNumber.message).to.eq('Cast to Number failed for value "hi" at path "frameNumber"');
      done();
    });
  });
  it('shouldn\'t accept numbers over 10 as frameNumber', () => {
    var frame = new frameModel({
      gameNumber: new mongoose.Types.ObjectId,
      frameNumber: 11,
      player: "William",
      nextPlayer: "William"
    });
    frame.validate((err) => {
      expect(err.errors.frameNumber).to.exist;
      expect(err.errors.frameNumber.message).to.eq('Path `frameNumber` (11) is more than maximum allowed value (10).');
      done();
    });
  });
  it('should have a default frameNumber', () => {
    var frame = new frameModel({
      gameNumber: new mongoose.Types.ObjectId,
      player: "William",
      nextPlayer: "William"
    });
    var fullFrame = frame.toObject( {minimize:false} );
    expect(fullFrame.frameNumber).to.eq(1);
  });
  it('should accept 10 as frameNumber', () => {
    var frame = new frameModel({
      gameNumber: new mongoose.Types.ObjectId,
      frameNumber: 10,
      player: "William",
      nextPlayer: "William"
    });
    frame.validate((err) => {
      expect(err).to.eq(null);
      done();
    });
  });

  it('should fail if there\'s no player', (done) => {
    var frame = new frameModel({
      gameNumber: new mongoose.Types.ObjectId,
      nextPlayer: "William"
    });
    frame.validate((err) => {
      expect(err.errors.player).to.exist;
      done();
    });
  });
  it('shouldn\'t accept empty strings as player', (done) => {
    var frame = new frameModel({
      gameNumber: new mongoose.Types.ObjectId,
      player: "",
      nextPlayer: "William"
    });
    frame.validate((err) => {
      expect(err.errors.player).to.exist;
      expect(err.errors.player.message).to.eq("Path `player` is required.");
      done();
    });
  });
  it('should accept only a string as player', (done) => {
    var frame = new frameModel({
      gameNumber: new mongoose.Types.ObjectId,
      player: "William",
      nextPlayer: "William"
    });
    frame.validate((err) => {
      expect(err).to.eq(null);
      done();
    });
  });

  it('should fail if there\'s no nextPlayer', (done) => {
    var frame = new frameModel({
      gameNumber: new mongoose.Types.ObjectId,
      player: "William"
    });
    frame.validate((err) => {
      expect(err.errors.nextPlayer).to.exist;
      done();
    });
  });
  it('shouldn\'t accept empty strings as nextPlayer', (done) => {
    var frame = new frameModel({
      gameNumber: new mongoose.Types.ObjectId,
      player: "William",
      nextPlayer: ""
    });
    frame.validate((err) => {
      expect(err.errors.nextPlayer).to.exist;
      expect(err.errors.nextPlayer.message).to.eq("Path `nextPlayer` is required.");
      done();
    });
  });
  it('should accept only a String as nextPlayer', (done) => {
    var frame = new frameModel({
      gameNumber: new mongoose.Types.ObjectId,
      player: "William",
      nextPlayer: "William"
    });
    frame.validate((err) => {
      expect(err).to.eq(null);
      done();
    });
  });

  it('accepts non-booleans--cast as Booleans--as finished', () => {
    var frame = new frameModel({
      gameNumber: new mongoose.Types.ObjectId,
      finished: "hi",
      player: "William",
      nextPlayer: "William"
    });
    frame.validate((err) => {
      expect(err).to.eq(null);
      var fullFrame = frame.toObject( {minimize:false} );
      expect(fullFrame.finished).to.eq(true);
      done();
    });
  });
  it('should have a default finished', () => {
    var frame = new frameModel({
      gameNumber: new mongoose.Types.ObjectId,
      player: "William",
      nextPlayer: "William"
    });
    var fullFrame = frame.toObject( {minimize:false} );
    expect(fullFrame.finished).to.eq(false);
  });

  it('should have a default rolls of []', () => {
    var frame = new frameModel({
      gameNumber: new mongoose.Types.ObjectId,
      player: "William",
      nextPlayer: "William"
    });
    var fullFrame = frame.toObject( {minimize:false} );
    expect(fullFrame.rolls).to.deep.eq([]);
  });
});

//describe('Unisoft MVR Endpoint - Correct request params', function (done){
//  beforeEach(function () {
//    server.listen(test_port);
//  });
//  this.timeout(config.TEST_TIMEOUT);
//  it('should return an MVRs', function (done){
//    api.post('/Unisoft/MVR')
//        .timeout(config.TEST_TIMEOUT)
//        .set('Content-Type', 'application/json')
//        .set('Authorization', 'Bearer '+config.TEST_JWT)
//        .send({
//          "insurance_company": "WIC",
//          "mvr_account": "6018",
//          "agent_code": "",
//          "drivers": [
//            {"license_number":"P626816897030", "state":"FL"},
//            {"license_number":"M635200808730", "state":"FL"}
//          ]
//        })
//        .end(function (err, res) {
//          // console.log(JSON.stringify(res.body));
//          expect(err).to.not.exist;
//          expect(res.body.status).to.equal(1);
//          expect(res.body.data).to.exist;
//          expect(res.body.data.json.RESPONSE).to.exist;
//          expect(res.body.data.json.RESPONSE.XMLMvrClassicInterface).to.exist;
//          expect(res.body.data.json.RESPONSE.XMLMvrClassicInterface[0].LICENSE).to.equal("P626816897030");
//          expect(res.body.data.json.RESPONSE.XMLMvrClassicInterface[0].UNIXML.Mvr).to.exist;
//          expect(res.body.data.json.RESPONSE.XMLMvrClassicInterface[0].UNIXML.Mvr.REFERENCENUMBER).to.be.a('string');
//          expect(res.body.data.json.RESPONSE.XMLMvrClassicInterface[0].UNIXML.Mvr.REQUESTOR).to.exist;
//          expect(res.body.data.json.RESPONSE.XMLMvrClassicInterface[0].UNIXML.Mvr.REQUESTOR.REQUESTORNAME).to.be.a('string');
//          expect(res.body.data.json.RESPONSE.XMLMvrClassicInterface[0].UNIXML.Mvr.REQUESTOR.REQUESTORADDRESS1).to.be.a('string');
//          expect(res.body.data.json.RESPONSE.XMLMvrClassicInterface[0].UNIXML.Mvr.REQUESTOR.REQUESTORADDRESS2).to.be.a('string');
//          expect(res.body.data.json.RESPONSE.XMLMvrClassicInterface[0].UNIXML.Mvr.MvrHeader).to.exist;
//          expect(res.body.data.json.RESPONSE.XMLMvrClassicInterface[0].UNIXML.Mvr.Violations).to.exist;
//          expect(res.body.data.json.RESPONSE.XMLMvrClassicInterface[0].UNIXML.Mvr.Violations.Violation).to.exist;
//          expect(res.body.data.json.RESPONSE.XMLMvrClassicInterface[1].LICENSE).to.equal("M635200808730");
//          expect(res.body.data.json.RESPONSE.XMLMvrClassicInterface[1].UNIXML.Mvr).to.exist;
//          expect(res.body.data.json.RESPONSE.XMLMvrClassicInterface[1].UNIXML.Mvr.REFERENCENUMBER).to.be.a('string');
//          expect(res.body.data.json.RESPONSE.XMLMvrClassicInterface[1].UNIXML.Mvr.REQUESTOR).to.exist;
//          expect(res.body.data.json.RESPONSE.XMLMvrClassicInterface[1].UNIXML.Mvr.REQUESTOR.REQUESTORNAME).to.be.a('string');
//          expect(res.body.data.json.RESPONSE.XMLMvrClassicInterface[1].UNIXML.Mvr.REQUESTOR.REQUESTORADDRESS1).to.be.a('string');
//          expect(res.body.data.json.RESPONSE.XMLMvrClassicInterface[1].UNIXML.Mvr.REQUESTOR.REQUESTORADDRESS2).to.be.a('string');
//          expect(res.body.data.json.RESPONSE.XMLMvrClassicInterface[1].UNIXML.Mvr.MvrHeader).to.exist;
//          expect(res.body.data.json.RESPONSE.XMLMvrClassicInterface[1].UNIXML.Mvr.Violations).to.exist;
//          expect(res.body.data.json.RESPONSE.XMLMvrClassicInterface[1].UNIXML.Mvr.Violations.Violation).to.exist;
//          done();
//        });
//  });
//  afterEach(function () {
//    server.close();
//  });
//});
//
//describe('Unisoft MVR Endpoint - Caching and Retrieval Test', function (done){
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
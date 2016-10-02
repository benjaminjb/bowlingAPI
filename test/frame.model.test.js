/**
 * Created by benjaminblattberg on 10/1/16.
 */
/* jshint node: true */
/* jshint esnext: true */
'use strict';

// Set up testing modules
const expect = require('chai').expect;

// Import to test frameModel
const mongoose = require('mongoose');
const frameModel = require('../lib/frame/frame.model');

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
/**
 * Created by benjaminblattberg on 9/29/16.
 */
/* jshint node: true */
/* jshint esnext: true */
'use strict';

const mongoose = require('mongoose');
const objectId = mongoose.Schema.ObjectId;

const FrameModel = {
  gameNumber  : {type: objectId,    required: true},
  frameNumber : {type: Number,      default : 1,    max: 10},
  player      : {type: String,      required: true, minlength: 1},
  nextPlayer  : {type: String,      required: true, minlength: 1},
  finished    : {type: Boolean,     default : false},
  rolls       : []
};

const FrameSchema = new mongoose.Schema(FrameModel, {collection: "frames"});
const Frame = mongoose.model('Frame', FrameSchema);

module.exports = Frame;
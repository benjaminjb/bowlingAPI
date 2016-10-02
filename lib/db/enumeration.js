///**
// * Created by benjaminblattberg on 10/1/16.
// */
///* jshint node: true */
///* jshint esnext: true */
//'use strict';
//
//
//// match on gameNumber, get frameMax
//// match on gamenumber, frame, order by finished false,lowest order, pull first -- if finished, create round
//var groupGameNumber = {'$group': {'_id': '$gameNumber', frameMax: {'$max': frameNumber}, frames: { $push: "$$ROOT" }}};
//
//
//const enumeration = {
//  nextPlayerUp: [
//    maxFrameNumber,
//    groupGameNumber,
//    lowestOrderNumber
//  ]
//
//  //aggregate on gameNumber , max frameNumber, lowest order
//};
//
//
//
//module.exports = enumeration;
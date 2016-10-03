/**
 * Created by benjaminblattberg on 10/3/16.
 */
/* jshint node: true */
/* jshint esnext: true */
'use strict';

const __ = require('lodash');

function transformFrame(frame) {
  if (!(typeof frame === 'object') || Array.isArray(frame)) {return}
  let trimmedFrame = {
    rolls: frame.rolls,
    player: frame.player,
    frameNumber: frame.frameNumber,
    special: frame.special
  };
  trimmedFrame.score = __.reduce(frame.rolls, (sum, n) => {
    if (typeof n === 'number') { return sum + n; }
    return sum;
  }, 0);

  return trimmedFrame;
}

module.exports = transformFrame;
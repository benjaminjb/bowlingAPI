/**
 * Created by benjaminblattberg on 10/1/16.
 */
/* jshint node: true */
/* jshint esnext: true */
'use strict';

const mongoose = require('mongoose');
const createRound = require('./frame.createRound');

function createGame(players) {
  return createRound(players);
}

module.exports = createGame;
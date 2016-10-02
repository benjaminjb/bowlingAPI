/**
 * Created by benjaminblattberg on 10/1/16.
 */
/* jshint node: true */
/* jshint esnext: true */
'use strict';

const server = require('./server/app');
const config = require('./config/index');

server.listen(config.PORT);
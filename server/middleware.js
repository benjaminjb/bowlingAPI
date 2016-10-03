/**
 * Created by benjaminblattberg on 9/29/16.
 */
/* jshint node: true */
/* jshint esnext: true */
'use strict';

const config = require('../config/index');
const log = require('../lib/log/logger');

/**
 * @Description
 *    Middleware functionality
 */
const _middleware = () => {

  return {
    spy: spy
  };

  /**
   * @Description:
   *    Watches and logs all incoming request url's and payloads
   */
  function spy(req, res, next) {
    log.info('REQUEST : ', req.method, ' ', req.url);
    log.debug('BODY: ', req.body);
    next();
  }

};

module.exports = _middleware();
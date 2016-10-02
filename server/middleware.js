/**
 * Created by benjaminblattberg on 9/29/16.
 */
/* jshint node: true */
/* jshint esnext: true */
'use strict';

const config = require('../config/index');
const auth = require('../lib/auth/auth');
const log = require('../lib/log/logger');

/**
 * @Description
 *    Middleware functionality
 */
const _middleware = () => {

  return {
    auth: auth,
    spy: spy
  };

  /**
   * @Description:
   *    Runs authentication process when a request is received.
   */
  function auth(req, res, next) {
    const authHeader = req.headers.authorization;
    auth.authenticate(authHeader)
        .then( () => {
          next();
        })
        .catch( err => {
          log.error('AUTH ERROR: ', err.message);
          log.error('AUTH ERROR: ', err.stack);
          return next(err);
        });
  }

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
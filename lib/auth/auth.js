/**
 * Created by benjaminblattberg on 10/1/16.
 */
/* jshint node: true */
/* jshint esnext: true */
'use strict';

const jwt = require('jsonwebtoken');
const __ = require('lodash');

/**
 * @Name _authUtil
 * @Description Contains functions used for verifying jwt authentication
 * @returns {{getToken: getToken, verifyTenant: verifyTenant, encodeToken: encodeToken, decodeToken: decodeToken, authenticate: authenticate}}
 * @private
 */
const _authUtil = () => {

  return {
    getToken: getToken,
    verifyTenant: verifyTenant,
    encodeToken: encodeToken,
    decodeToken: decodeToken,
    authenticate: authenticate
  };


  /**
   * @Name authenticate()
   * @Description: returns Promise chain of function calls required to verify a users
   *               credentials
   * @param authHeader
   * @returns {Promise.<token>}
   */
  function authenticate(authHeader){
    return Promise
        .resolve(getToken(authHeader))
        .then( tokenStr => {
          return decodeToken(tokenStr);
        })
        .then( decodeToken => {
          return verifyTenant(decodeToken);
        });
  }

  /**
   * @Name: getToken
   * @Description
   *    Retrieves token from Authorization header and throws error if not found
   *
   * @param authHeader - The value at header key 'Authorization'
   * @returns token - The string provided at header key 'Authorization'
   */
  function getToken(authHeader){
    if(!authHeader || authHeader.indexOf('Bearer') !== 0 ){
      const error = new Error('Authentication failed. Token not found in header.');
      error.type = "FAILED_JWT_AUTHENTICATION";
      throw error;
    } else {
      const token = authHeader.split(' ')[1];
      return token;
    }
  }

  /**
   * @Name decodeToken
   * @Description decodes the received token information
   * @param token - token string to be decoded
   * @returns Promise - resolves to object containing token information
   */
  function decodeToken(token){
    return new Promise( (resolve, reject) => {
      jwt.verify(token, SECRET, function(err, tokenInfo){
        if(err) reject(err);
        resolve(tokenInfo);
      });
    });
  }

  /**
   * @Name: verifyTenant
   * @Description: verifies that the token information matches a listed tenant
   * @param tokenInfo - jwt string
   */
  function verifyTenant(tokenInfo){
    const tenantQuery = {
      user: tokenInfo.user,
    };
    const equality = __.where(tenants, tenantQuery).length === 1 ? true: false;
    const tempEquality = tokenInfo.roles[0] === 'agentDetails'; //TODO: temp hack for TC
    if(!equality && !tempEquality){
      const error = new Error('Authentication failed. Invalid Token.');
      error.type = "FAILED_JWT_AUTHENTICATION";
      throw error;
    }

    return;
  }

  /**
   * @Name encodeToken
   * @Description receives token information and returns a signed jwt
   * @param tokenInfo - information to be contained in the jwt
   * @returns Promise - resolves to token
   */
  function encodeToken(tokenInfo){
    return new Promise( (resolve, reject) => {
      jwt.sign(tokenInfo, SECRET, {},function(err, token){
        if(err) reject(err);
        resolve(token);
      });
    });
  }

};

module.exports = _authUtil();
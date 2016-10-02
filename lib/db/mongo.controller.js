/**
 * Created by benjaminblattberg on 9/29/16.
 */
/* jshint node: true */
/* jshint esnext: true */
'use strict';

// Import Mongoose
const mongoose = require('mongoose');
const Promise  = require('bluebird');
mongoose.Promise = Promise;

// Import object schemas and arrange for use
const frameModel = require('../frame/frame.model');
const objectSchemas = {
  frameModel: frameModel
};

// Import accessory modules
const log = require('../log/logger');


/**
 * @Name mongooseDAO
 * @Description
 *    Data access object for Mongoose integration
 */
const mongooseDAO = () => {

  return {
    connect   : connect,
    disconnect: disconnect,
    find      : find,
    findOneAndUpsert: findOneAndUpsert,
    removeAll      : removeAll,

  };

  /**
   * @Name connect
   * @Description
   *    connects to MongoDB
   */
  function connect(uri, options){
    return Promise
      .resolve(mongoose.connect(uri, options))
      .then( (res) => {
        log.info("MongoDB connection made to", uri);
      })
      .catch( (err) => {
        log.error('MongoDB connection error: ' + err);
        process.exit(-1);
      });
  }

  /**
   * @Name disconnect
   * @Description
   *    disconnects from MongoDB
   */
  function disconnect() {
    return Promise.resolve(mongoose.connection.close())
      .then( () => {
        log.info('MongoDB disconnected through app termination');
      })
  }

  /**
   * @Name find
   * @Description
   *    finds documents in MongoDB
   * @param type - String, name of model to be searched, must be in objectSchemas
   * @param query - Object to be searched on, defaults to empty for find all
   */
  function find(type, query) {
    let queryObj = query || {};
    return objectSchemas[type].find(queryObj);
  }

  /**
   * @Name findOneAndUpsert
   * @Description
   *    finds single document and updates it OR creates document if none exists
   * @param type - String, name of model to be searched, must be in objectSchemas
   * @param query - Object to be searched on
   * @param update - Updated object to be saved, with fields using $set
   */
  function findOneAndUpsert(type, query, update) {
    // Note that $push operator on rolls allows array to be pushed into instead of replaced
    if (update.rolls) {
      update['$push'] = {rolls: update.rolls};
      delete update.rolls;
    }

    return objectSchemas[type].findOneAndUpdate(query, update, {upsert: true, setDefaultsOnInsert: true});
  }

  /**
   * @Name removeAll
   * @Description
   *    removes all documents of a model
   * @param type - String, name of model to be searched, must be in objectSchemas
   */
  function removeAll(type) {
    return objectSchemas[type].remove({}).exec();
  }

};

module.exports = mongooseDAO();
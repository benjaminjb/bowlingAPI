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
//const enumeration = require('./enumeration');

// Import accessory modules
const log = require('../log/logger');
const __ = require('lodash');

/**
 * @Description
 *    Data access object for Mongoose integration
 */
const mongooseDAO = () => {

  return {
    connect   : connect,
    disconnect: disconnect,
    save      : save,
    find      : find,
    findOne   : findOne,
    findAndUpdate:  findAndUpdate,
    findAndOrder    : findAndOrder,
    removeAll : removeAll,
    aggregate : aggregate
  };

  /**
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
   * @Description
   *    saves
   * @param type - String, name of model to be searched, must be in objectSchemas
   * @param doc
   */
  function save(type, doc) {
    if (!doc.$__ ) {
      doc = new objectSchemas[type](doc);
    }
    return doc.save();
  }

  /**
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
   * @Description
   *    finds one document in MongoDB that matches the query
   * @param type - String, name of model to be searched, must be in objectSchemas
   * @param query - Object to be searched on, defaults to empty for find all
   */
  function findOne(type, query) {
    let queryObj = query || {};
    return objectSchemas[type].findOne(queryObj);
  }

  /**
   * @Description
   *    find and upate
   * @param type - String, name of model to be searched, must be in objectSchemas
   * @param query - Object to be searched on, defaults to empty for find all
   * @param update - Object to be updated on
   */
  function findAndUpdate(type, query, update) {
    let queryObj = query || {};
    return objectSchemas[type].findOneAndUpdate(queryObj, update);
  }

  /**
   * @Description
   *    Find and order according to some parameter
   * @param type - String, name of model to be searched, must be in objectSchemas
   * @param query
   * @param order - { FIELD_NAME : Ascending 1 or Descending -1 }
   */
  function findAndOrder(type, query, order) {
    let queryObj = query || {};
    let orderObj = order || {};
    return objectSchemas[type].find(queryObj).sort(orderObj);
  }

  /**
   * @Description
   *    removes all documents of a model
   * @param type - String, name of model to be searched, must be in objectSchemas
   */
  function removeAll(type) {
    return objectSchemas[type].remove({}).exec();
  }

  /**
   * @Description
   *    light wrapper around aggregation pipeline
   * @param type - String, name of model to be searched, must be in objectSchemas
   * @param aggregationPipeline
   */
  function aggregate(type, aggregationPipeline) {
    return objectSchemas[type].aggregate(aggregationPipeline).exec();
  }

};

module.exports = mongooseDAO();
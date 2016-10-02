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
    findAndOrder    : findAndOrder,
    removeAll      : removeAll,
    aggregate : aggregate,

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

  function findOne(type, query) {
    let queryObj = query || {};
    return objectSchemas[type].findOne(queryObj);
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
    // 1) Find the original document
    return findOne(type, query)
      .then((original) => {
        // 2) If no original document, create a new one
        if (!original) {
          original = new objectSchemas[type](query);
        }
        // 3) For all key-value pairs of the update object
        __.forOwn(update, (value, key) => {
          // 3a) Copy the new values for update's key-value except "rolls"
          if (key !== "rolls") {
            original[key] = value;
          } else {
          // 3b) If original.rolls doesn't exist, add update.rolls
            if (!original.rolls
                || !Array.isArray(original.rolls)
                || original.rolls.length == 0 ) {
              if (Array.isArray(value)) {
                original[key] = value;
              } else {
                original[key] = [value];
              }
            } else {
          // 3c) Check original.rolls for an ObjectID
              let index = __.findIndex(original[key], (roll) => {
                return typeof roll == 'object'
              });
              // 3cA) If there's an ObjectID, use that to update a different doc, before replacing that ObjectID with the value
              if (index > -1) {
                findOneAndUpsert(type, {_id: original[key][index]}, {rolls: value});
                original[key][index] = update.rolls;
              } else {
              // 3cB) Otherwise just push the value into the rolls array
                if (Array.isArray(update.rolls)) {
                  original[key].concat(update.rolls)
                } else {
                  original[key].push(update.rolls);
                }
              }
              if (original[key].length >= 2) {
                original.finished = true;
              }
            }
          }
        });
        // 4) Save the document
          return original.save();
        //return objectSchemas[type].save(original);
      })
      .catch((err) => {
        console.error('Error getting/updating/saving document', err.message)
        //throw new Error('Error getting/updating/saving document', err.message);
      })
  }

  function findAndOrder(type, query, order) {
    let queryObj = query || {};
    let orderObj = order || {};
    return objectSchemas[type].find(queryObj).sort(orderObj);
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

  function aggregate(type, aggregationPipeline) {
    //let aggregationPipeline = [];
    //if (searchType === 'nextPlayerUp') {
    //  aggregationPipeline.push(enumeration())
    //}
    return objectSchemas[type].aggregate(aggregationPipeline).exec();
  }

};

module.exports = mongooseDAO();
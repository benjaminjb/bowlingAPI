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
    findOneAndUpsert: findOneAndUpsert,
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
   * @Name findOneAndUpsert
   * @Description
   *    finds single document and updates it OR creates document if none exists
   * @param type - String, name of model to be searched, must be in objectSchemas
   * @param query - Object to be searched on
   * @param update - Updated object to be saved, with fields using $set
   */
  function findOneAndUpsert(type, query, update) {
    let id;
    // 1) Find the original document
    return findOne(type, query)
      .then((original) => {
        // 2) If no original document, create a new one
        if (!original) {
          original = new objectSchemas[type](query);
        }
        return original;
      })
      .then( (originalFrame) => {
        // 3) For all key-value pairs of the update object
        __.forOwn(update, (value, key) => {
          // 3a) Copy the new values for update's key-value except "rolls"
          if (key !== "rolls") {
            originalFrame[key] = value;
          }
        });
        return originalFrame;
      })
      .then((partlyUpdated) => {
        // 4) For update.rolls, update in the following way
        if (update.rolls) {
          // 4a) If original.rolls doesn't exist, add update.rolls as an array
          if (!partlyUpdated.rolls
              || (Array.isArray(partlyUpdated.rolls) && partlyUpdated.rolls.length == 0 )) {
            partlyUpdated.rolls = Array.isArray(update.rolls) ? update.rolls : [update.rolls];
          } else {
          // 4b) If original.rolls exists, check for the first ObjectID by checking for a length
            let index = __.findIndex(partlyUpdated.rolls, (roll) => {
              return typeof roll === 'object';
            });
            // 4bA) If there was an ObjectID, save it before replacing with the value in update.rolls
            if (index > -1) {
              id = partlyUpdated.rolls[index];
              partlyUpdated.rolls.splice(index,1,update.rolls);
            } else {
            // 4bB) Otherwise just push the new value into the old rolls array
              partlyUpdated.rolls.push(update.rolls);
            }
          }
        }
        return partlyUpdated;
      })
      .then((updatedWithRolls) => {
        // 5) Update the finished flag if we have more than one roll or the score is over 10
        let score = __.reduce(updatedWithRolls.rolls, function(sum, n) {
          if (typeof n === 'number') { return sum + n; }
          return sum;
        }, 0);
        if (!updatedWithRolls.finished && (updatedWithRolls.rolls.length > 1 || score >= 10 )) {
          updatedWithRolls.finished = true;
        }
        // 6) Save the new fully-updated document
        return updatedWithRolls.save();
      })
      .then((saved) => {
        // 7) IF we had the ID of another document to update, update with the roll
        if (id) {
          return findOneAndUpsert(type, {_id: id}, {rolls: update.rolls});
        } else {
          return Promise.resolve(saved);
        }
      })
      .catch((err) => {
        log.error('Error getting/updating/saving document', err.message);
        throw new Error('Error getting/updating/saving document', err.message);
      })
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
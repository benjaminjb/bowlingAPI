/**
 * Created by benjaminblattberg on 10/3/16.
 */
/* jshint node: true */
/* jshint esnext: true */
'use strict';

process.env.NODE_ENV = "test";
const config = require('../config/index');

// Set up testing modules
const expect = require('chai').expect;

// Import to test
const transformFrame = require('../lib/utils/frame.transformFrame');

describe('transformFrame', () => {

  it('should be a function', () =>{
    expect(transformFrame).to.be.an.instanceOf(Function);
  });
  it('should create a truncated form of the frame, with a score field', () => {
    let frame = {
      name: "Ben",
      occupation: "Developer",
      rolls: [20, 20],
      player: "BenJB",
      frameNumber: 2,
    };
    let transformedFrame = transformFrame(frame);
    expect(transformedFrame).to.have.property('player').and.equal('BenJB');
    expect(transformedFrame).to.have.property('rolls').and.deep.equal([20,20]);
    expect(transformedFrame).to.have.property('frameNumber').and.equal(2);
    expect(transformedFrame).to.have.property('score').and.equal(40);

  });
});
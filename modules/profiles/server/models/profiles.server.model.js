'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Profile Schema
Family
Health
Rest and Relaxation
Faith
Finance
Romance
Friends
Contribution
Personal Growth
Career
Physical Environment
 */

var ProfileSchema = new Schema({
  last_modified: {
    type: Date,
    default: Date.now
  },
  created_on: {
    type: Date,
    default: Date.now
  },
  Priority: [{
    Family: Number,
    Health: Number,
    Rest_and_Relaxation: Number,
    Faith: Number,
    Finance: Number,
    Romance: Number,
    Friends: Number,
    Contribution: Number,
    Personal_Growth: Number,
    Career: Number,
    Physical_Environment: Number
  }],
  Satisfaction: [{
    Family: Number,
    Health: Number,
    Rest_and_Relaxation: Number,
    Faith: Number,
    Finance: Number,
    Romance: Number,
    Friends: Number,
    Contribution: Number,
    Personal_Growth: Number,
    Career: Number,
    Physical_Environment: Number
  }],
  user: {
    type: Schema.ObjectId,
    ref: 'User',
    unique: true
  }
});

mongoose.model('Profile', ProfileSchema);

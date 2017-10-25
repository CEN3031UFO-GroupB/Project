'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Profile Schema
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
    Security: Number,
    Personal_Growth: Number
  }],
  Satisfaction: [{
    Personal_Growth: Number,
    Career: Number,
    Family_and_Friends: Number,
    Health: Number,
    Physical_Env: Number,
    Romance: Number,
    Money: Number,
    Fun: Number
  }],
  user: {
    type: Schema.ObjectId,
    ref: 'User',
    unique: true
  }
});

mongoose.model('Profile', ProfileSchema);

'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Goal Schema
 */
var GoalSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Goal name',
    trim: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Goal', GoalSchema);

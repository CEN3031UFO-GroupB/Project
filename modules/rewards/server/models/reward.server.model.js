'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Reward Schema
 */
var RewardSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Reward name',
    trim: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  claimed: {
    type: Boolean,
    default: false
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  claimed_on: {
    type: Date
  }
});


mongoose.model('Reward', RewardSchema);

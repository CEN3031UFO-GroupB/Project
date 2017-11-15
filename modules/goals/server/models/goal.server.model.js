'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Individual goals schema
*/
var GoalsSchema = new Schema({
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  title: {
    type: String,
    default: '',
    required: 'Please add a goal title',
    trim: true
  },
  description: {
    type: String,
    default: '',
    required: 'Please add a goal description'
  },
  category: {
    type: String,
    required: 'Please add a category for your goal'
  },
  status: {
    type: String,
    default: 'Not Started',
    enum: ['Not Started', 'In Progress', 'Completed'],
    required: 'Please set a status for the goal'
  },
  created_at: {
    type: Date,
    default: new Date()
  },
  started_at: {
    type: Date,
    default: null
  },
  completed_at: {
    type: Date,
    default: null
  },
  updated_at: {
    type: Date,
    default: new Date()
  },
  week_timestamp: {
    type: Date,
    default: new Date()
  },
  ranking: {
    type: String
  }
});

/**
 * GoalsList Schema
 */
var GoalsListSchema = new Schema({
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  goals: [GoalsSchema]
});

mongoose.model('GoalsList', GoalsListSchema);
mongoose.model('Goal', GoalsSchema);

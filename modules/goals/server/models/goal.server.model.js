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
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  week_timestamp: {
    type: Date,
    default: Date.now
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

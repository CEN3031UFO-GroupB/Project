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
  Priority: [{
    Family: {type: Number, min: 1, max: 10},
    Health: {type: Number, min: 1, max: 10},
	Rest_and_Relaxation: {type: Number, min: 1, max: 10},
	Faith: {type: Number, min: 1, max: 10},
	Finance: {type: Number, min: 1, max: 10},
	Romance: {type: Number, min: 1, max: 10},
	Friends: {type: Number, min: 1, max: 10},
	Contribution: {type: Number, min: 1, max: 10},
	Security: {type: Number, min: 1, max: 10},
	Personal_Growth: {type: Number, min: 1, max: 10}
  }],
  Satisfaction: [{
  	Personal_Growth: {type: Number, min: 0, max: 10},
  	Career: {type: Number, min: 0, max: 10},
  	Family_and_Friends: {type: Number, min: 0, max: 10},
  	Health: {type: Number, min: 0, max: 10},
  	Physical_Env: {type: Number, min: 0, max: 10},
  	Romance: {type: Number, min: 0, max: 10},
  	Money: {type: Number, min: 0, max: 10},
  	Fun: {type: Number, min: 0, max: 10}
  }],
  user: {
    type: Schema.ObjectId,
    ref: 'User',
    unique: true
  }
});

mongoose.model('Profile', ProfileSchema);

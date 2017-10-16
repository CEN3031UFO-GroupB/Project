'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var VerificationSchema = new Schema({
  code: {
    type: String,
    unique: true,
    sparse: true
  },
  user_id: String,
  active: Boolean,
  created_at: Date
});

mongoose.model('Verification', VerificationSchema);

'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Verification = mongoose.model('Verification'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

//Creates a new admin verification code
//depending on the code string supplied
exports.create = function (req, res) {
  var verification = new Verification(req.body);

  verification.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(verification);
    }
  });
};

//Returns one verification depending on code
exports.read = function (req, res) {
  res.json(req.verification);
};

//Updates the verification code's user and active
//properties in the database
exports.update = function (req, res) {
  var verification = req.verification;

  verification.active = req.body.verification.active;
  verification.user_id = req.body.verification.user_id;

  verification.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(verification);
    }
  });
};

//Lists all codes in the database
exports.list = function(req, res) {
  Verification.find().sort('code').exec(function(err, verifications) {
    if(err) {
      res.status(400).send(err);
    } else {
      res.json(verifications);
    }
  });
};

//Return the verification code depending on the code supplied
//or return an error message if the code was invalid
exports.verificationByCode = function (req, res, next, code) {
  Verification.findOne({ 'code': code }).exec(function (err, verification) {
    if (err) {
      return next(err);
    } else if (!verification) {
      return res.status(404).send({
        message: 'The verification code does not exist'
      });
    }
    req.verification = verification;
    next();
  });
};


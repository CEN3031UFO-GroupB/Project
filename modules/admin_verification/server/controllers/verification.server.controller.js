'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Verification = mongoose.model('Verification'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

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

exports.read = function (req, res) {
  res.json(req.verification);
};

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


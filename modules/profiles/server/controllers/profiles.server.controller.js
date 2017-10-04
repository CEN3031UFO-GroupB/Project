'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Profile = mongoose.model('Profile'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));


exports.create = function (req, res) {
  var profile = new Profile(req.body);
  profile.user = req.user;

  profile.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(profile);
    }
  });
};

exports.read = function (req, res) {
  res.json(req.profile);
};

exports.update = function (req, res) {
  var profile = req.profile;

  profile.last_modified = Date.now;

  profile.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(profile);
    }
  });
};

exports.delete = function (req, res) {
  var profile = req.profile;

  profile.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(profile);
    }
  });
};

/**
 * Only lists the current user's profile
 */
exports.list = function (req, res) {
  Profile.find({user: req.user}).populate('user', 'displayName').exec(function (err, profile) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(profile);
    }
  });
};

exports.articleByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Invalid profile ID'
    });
  }

  Profile.findById(id).populate('user', 'displayName').exec(function (err, profile) {
    if (err) {
      return next(err);
    } else if (!profile) {
      return res.status(404).send({
        message: 'The profile does not exist'
      });
    }
    req.profile = profile;
    next();
  });
};


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

  // Check if profile was last updated over 12 weeks ago
  // Return error message if not
  var oneDay = 24*60*60*1000;
  var daysElapsed = Math.round(Math.abs((profile.last_modified.getTime() - (new Date()).getTime())/(oneDay)));
  var daysSinceCreated = Math.round(Math.abs((profile.created_on.getTime() - (new Date()).getTime())/(oneDay)));
  if(daysElapsed < 7*12 && daysSinceCreated > 1){
    return res.status(400).send({
      message: 'Priorities and Satisfaction ratings can be updated every 12 weeks.'
    });
  }

  profile.last_modified = new Date();
  profile.Satisfaction = req.body.Satisfaction;
  profile.Priority = req.body.Priority;

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
  var userId = '';
  if(req.query.user)
	  userId = req.query.user;
  else
	  userId = req.user._id;
  Profile.findOne({ user: userId }).populate('user', 'displayName').exec(function (err, profile) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(profile);
    }
  });
};

exports.profileByID = function (req, res, next, id) {

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


'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Goal = mongoose.model('Goal'),
  GoalsList = mongoose.model('GoalsList'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');


function getThisMonday() {
  d = new Date.now();
  var day = d.getDay(),
    diff = d.getDate() - day + (day == 0 ? -6:1);
  return new Date(d.setDate(diff));
}

function getNextMonday() {
  d = new Date.now();
  return new Date(d.setDate(d.getDate() + 7));
}

/**
 * Create a Goal
 */
exports.create = function(req, res) {
  var goal = new Goal(req.body);
  goal.user = req.user;

  //Create a goal in the goals collection
  goal.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(goal);
    }
  });

  //Append that goal to the user's list
  GoalsList.findOneAndUpdate({user: goal.user}, {$push: {goals: goal}}, {upsert: true}).exec(function(err,goal) {
    if(err) {
      console.log(err);
      return err;
    } else if(goal) {
      console.log(goal);
      return goal;
    }
  })
};

/**
 * Show the current Goal
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var goal = req.goal ? req.goal.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  goal.isCurrentUserOwner = req.user && goal.user && goal.user._id.toString() === req.user._id.toString();

  res.jsonp(goal);
};

/**
 * Update a Goal
 */
exports.update = function(req, res) {
  var goal = req.goal;

  goal = _.extend(goal, req.body);

  goal.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(goal);
    }
  });


};

/**
 * Delete an Goal
 */
exports.delete = function(req, res) {
  var goal = req.goal;

  goal.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(goal);
    }
  });
};

/**
 * List current Week's Goals
 */
exports.list = function(req, res) {
  GoalsList.find({goals: {
    week_timestamp: {
      $gte: getThisMonday(),
      $lt: getNextMonday()
    }
  }
}).populate('user', 'displayName').exec(function(err, goals) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(goals);
    }
  });
};

/**
 * List of All Goals
 */
exports.listAll = function(req, res) {
  Goal.find().sort('-created').populate('user', 'displayName').exec(function(err, goals) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(goals);
    }
  });
};

/**
 * Goal middleware
 */
exports.goalByID = function(req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Goal is invalid'
    });
  }

  Goal.findById(id).populate('user', 'displayName').exec(function (err, goal) {
    if (err) {
      return next(err);
    } else if (!goal) {
      return res.status(404).send({
        message: 'No Goal with that identifier has been found'
      });
    }
    req.goal = goal;
    next();
  });
};

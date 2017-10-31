'use strict';

/**
 * Module dependencies
 */
var goalsPolicy = require('../policies/goals.server.policy'),
  goals = require('../controllers/goals.server.controller');

module.exports = function(app) {
  // Goals Routes
  app.route('/api/goals').all(goalsPolicy.isAllowed)
    .get(goals.list)
    .post(goals.create);

  app.route('/api/goals/future').all(goalsPolicy.isAllowed)
    .get(goals.listNext)
    .post(goals.create);

  app.route('/api/goals/:goalId').all(goalsPolicy.isAllowed)
    .get(goals.read)
    .put(goals.update)
    .delete(goals.delete);

  // Finish by binding the Goal middleware
  app.param('goalId', goals.goalByID);
};

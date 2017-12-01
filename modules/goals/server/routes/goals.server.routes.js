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

  app.route('/api/goals/:goalId').all(goalsPolicy.isAllowed)
    .get(goals.read)
    .put(goals.update)
    .delete(goals.delete);

  app.route('/api/admin/goals/:userId').all(goalsPolicy.isAllowed)
    .get(goals.adminList);

  // Finish by binding the Goal middleware
  app.param('goalId', goals.goalByID);
};

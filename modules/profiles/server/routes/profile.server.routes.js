'use strict';

var profiles = require('../controllers/profiles.server.controller');

module.exports = function (app) {

  app.route('/api/profiles')
    .get(profiles.list)
    .post(profiles.create);


  app.route('/api/profiles/:profileId')
    .get(profiles.read)
    .put(profiles.update)
    .delete(profiles.delete);


  app.param('profileId', profiles.profileByID);
};

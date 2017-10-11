'use strict';

var verifications = require('../controllers/verification.server.controller');

module.exports = function (app) {

  app.route('/api/verifications/')
    .post(verifications.create);

  app.route('/api/verifications/:code')
    .get(verifications.read)
	.put(verifications.update);

  app.param('code', verifications.verificationByCode);
};

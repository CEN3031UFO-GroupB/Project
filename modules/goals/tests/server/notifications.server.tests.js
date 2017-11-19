'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Goal = mongoose.model('Goal'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  goal;

/**
 * Goal routes tests
 */
describe('Goal Notifications Tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'felixoe',
      password: 'test123456!A'
    };
      done();
  });

  it('should be able to retrieve notifications settings', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }
		
		var userId = signinRes.body._id;

        // Retrieve current settings
		agent.get('/api/notifications')
		  .end(function (settingsGetErr, settingsGetRes) {
			// Handle Settings retrieve error
			if (settingsGetErr) {
			  return done(settingsGetErr);
			}
			
			// Get Settings
			var settings = settingsGetRes.body;

			// Set assertions
			(settings.body).should.not.be.equal('');
			(settings.ending).should.not.be.equal('');
			(settings.greeting).should.not.be.equal('');
			(parseInt(settings.day)).should.be.a.Number();
			(parseInt(settings.time)).should.be.a.Number();

			// Call the assertion callback
			done();
		  });
      });
  });
});

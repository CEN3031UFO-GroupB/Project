'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
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
describe('Profiles Tests User', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'felixoeu',
      password: 'test123456!A'
    };
    done();
  });
  
    it('user should be able to retrieve own profile', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        var userId = signinRes.body._id;

        // Retrieve all profiles
        agent.get('/api/profiles/')
        .end(function (profilesGetErr, profilesGetRes) {
          // Handle profiles retrieve error
          if (profilesGetErr) {
            return done(profilesGetErr);
          }
			
          // Get profiles
          var profile = profilesGetRes.body;

          // Set assertions
          (profile).should.not.be.null;
          (profile.Satisfaction).should.not.be.null;
          (profile.Priority).should.not.be.null;

          // Call the assertion callback
          done();
        });
      });
  });
});

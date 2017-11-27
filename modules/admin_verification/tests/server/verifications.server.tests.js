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
describe('Verifications Tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create admin credentials
    credentials = {
      username: '',
      password: ''
    };
    done();
  });
  
    it('admin should be able to retrieve all verification codes', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        var userId = signinRes.body._id;

        // Retrieve all Verifications
        agent.get('/api/verifications/')
        .end(function (VerificationsGetErr, VerificationsGetRes) {
          // Handle Verifications retrieve error
          if (VerificationsGetErr) {
            return done(VerificationsGetErr);
          }
			
          // Get Verifications
          var verifications = VerificationsGetRes.body;

          // Set assertions
          (verifications).should.not.be.null;
          (verifications.length).should.be.above(0);

          // Call the assertion callback
          done();
        });
      });
  });
  
    it('all verification codes should either be active or inactive', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        var userId = signinRes.body._id;

        // Retrieve all Verifications
        agent.get('/api/verifications/')
        .end(function (VerificationsGetErr, VerificationsGetRes) {
          // Handle Verifications retrieve error
          if (VerificationsGetErr) {
            return done(VerificationsGetErr);
          }
			
          // Get Verifications
          var verifications = VerificationsGetRes.body;
		  
          (verifications).should.not.be.null;
          (verifications.length).should.be.above(0);

          // Set assertions
		  for(var i = 0; i < verifications.length; i++)
            (verifications[i].active).should.be.equalOneOf(true, false);

          // Call the assertion callback
          done();
        });
      });
  });
});

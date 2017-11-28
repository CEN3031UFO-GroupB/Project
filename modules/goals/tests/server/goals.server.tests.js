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
describe('Goals Tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: '',
      password: ''
    };
    done();
  });

  it('should be able to retrieve all goals', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        var userId = signinRes.body._id;

        // Retrieve all goals
        agent.get('/api/goals')
        .end(function (goalsGetErr, goalsGetRes) {
          // Handle Goals retrieve error
          if (goalsGetErr) {
            return done(goalsGetErr);
          }
			
          // Get Goals
          var goals = goalsGetRes.body;

          // Set assertions
          (goals).should.not.be.null;
          (goals.length).should.be.above(0);

          // Call the assertion callback
          done();
        });
      });
  });
  
    it('should be able to retrieve a goal', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        var userId = signinRes.body._id;

        // Retrieve all goals
        agent.get('/api/goals/5a1ae5a0e50453a02cd6ae22')
        .end(function (goalsGetErr, goalsGetRes) {
          // Handle Goals retrieve error
          if (goalsGetErr) {
            return done(goalsGetErr);
          }
			
          // Get Goals
          var goal = goalsGetRes.body;

          // Set assertions
          (goal).should.not.be.null;
          (goal.category).should.be.equal('Health');

          // Call the assertion callback
          done();
        });
      });
  });
});

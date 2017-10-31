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
describe('Goal CRUD tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new Goal
    user.save(function () {
      goal = {
        name: 'Goal name'
      };

      done();
    });
  });

  it('should be able to save a Goal if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Goal
        agent.post('/api/goals')
          .send(goal)
          .expect(200)
          .end(function (goalSaveErr, goalSaveRes) {
            // Handle Goal save error
            if (goalSaveErr) {
              return done(goalSaveErr);
            }

            // Get a list of Goals
            agent.get('/api/goals')
              .end(function (goalsGetErr, goalsGetRes) {
                // Handle Goals save error
                if (goalsGetErr) {
                  return done(goalsGetErr);
                }

                // Get Goals list
                var goals = goalsGetRes.body;

                // Set assertions
                (goals[0].user._id).should.equal(userId);
                (goals[0].name).should.match('Goal name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Goal if not logged in', function (done) {
    agent.post('/api/goals')
      .send(goal)
      .expect(403)
      .end(function (goalSaveErr, goalSaveRes) {
        // Call the assertion callback
        done(goalSaveErr);
      });
  });

  it('should not be able to save an Goal if no name is provided', function (done) {
    // Invalidate name field
    goal.name = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Goal
        agent.post('/api/goals')
          .send(goal)
          .expect(400)
          .end(function (goalSaveErr, goalSaveRes) {
            // Set message assertion
            (goalSaveRes.body.message).should.match('Please fill Goal name');

            // Handle Goal save error
            done(goalSaveErr);
          });
      });
  });

  it('should be able to update an Goal if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Goal
        agent.post('/api/goals')
          .send(goal)
          .expect(200)
          .end(function (goalSaveErr, goalSaveRes) {
            // Handle Goal save error
            if (goalSaveErr) {
              return done(goalSaveErr);
            }

            // Update Goal name
            goal.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Goal
            agent.put('/api/goals/' + goalSaveRes.body._id)
              .send(goal)
              .expect(200)
              .end(function (goalUpdateErr, goalUpdateRes) {
                // Handle Goal update error
                if (goalUpdateErr) {
                  return done(goalUpdateErr);
                }

                // Set assertions
                (goalUpdateRes.body._id).should.equal(goalSaveRes.body._id);
                (goalUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Goals if not signed in', function (done) {
    // Create new Goal model instance
    var goalObj = new Goal(goal);

    // Save the goal
    goalObj.save(function () {
      // Request Goals
      request(app).get('/api/goals')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Goal if not signed in', function (done) {
    // Create new Goal model instance
    var goalObj = new Goal(goal);

    // Save the Goal
    goalObj.save(function () {
      request(app).get('/api/goals/' + goalObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', goal.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Goal with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/goals/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Goal is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Goal which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Goal
    request(app).get('/api/goals/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Goal with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Goal if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Goal
        agent.post('/api/goals')
          .send(goal)
          .expect(200)
          .end(function (goalSaveErr, goalSaveRes) {
            // Handle Goal save error
            if (goalSaveErr) {
              return done(goalSaveErr);
            }

            // Delete an existing Goal
            agent.delete('/api/goals/' + goalSaveRes.body._id)
              .send(goal)
              .expect(200)
              .end(function (goalDeleteErr, goalDeleteRes) {
                // Handle goal error error
                if (goalDeleteErr) {
                  return done(goalDeleteErr);
                }

                // Set assertions
                (goalDeleteRes.body._id).should.equal(goalSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Goal if not signed in', function (done) {
    // Set Goal user
    goal.user = user;

    // Create new Goal model instance
    var goalObj = new Goal(goal);

    // Save the Goal
    goalObj.save(function () {
      // Try deleting Goal
      request(app).delete('/api/goals/' + goalObj._id)
        .expect(403)
        .end(function (goalDeleteErr, goalDeleteRes) {
          // Set message assertion
          (goalDeleteRes.body.message).should.match('User is not authorized');

          // Handle Goal error error
          done(goalDeleteErr);
        });

    });
  });

  it('should be able to get a single Goal that has an orphaned user reference', function (done) {
    // Create orphan user creds
    var _creds = {
      username: 'orphan',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create orphan user
    var _orphan = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'orphan@test.com',
      username: _creds.username,
      password: _creds.password,
      provider: 'local'
    });

    _orphan.save(function (err, orphan) {
      // Handle save error
      if (err) {
        return done(err);
      }

      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var orphanId = orphan._id;

          // Save a new Goal
          agent.post('/api/goals')
            .send(goal)
            .expect(200)
            .end(function (goalSaveErr, goalSaveRes) {
              // Handle Goal save error
              if (goalSaveErr) {
                return done(goalSaveErr);
              }

              // Set assertions on new Goal
              (goalSaveRes.body.name).should.equal(goal.name);
              should.exist(goalSaveRes.body.user);
              should.equal(goalSaveRes.body.user._id, orphanId);

              // force the Goal to have an orphaned user reference
              orphan.remove(function () {
                // now signin with valid user
                agent.post('/api/auth/signin')
                  .send(credentials)
                  .expect(200)
                  .end(function (err, res) {
                    // Handle signin error
                    if (err) {
                      return done(err);
                    }

                    // Get the Goal
                    agent.get('/api/goals/' + goalSaveRes.body._id)
                      .expect(200)
                      .end(function (goalInfoErr, goalInfoRes) {
                        // Handle Goal error
                        if (goalInfoErr) {
                          return done(goalInfoErr);
                        }

                        // Set assertions
                        (goalInfoRes.body._id).should.equal(goalSaveRes.body._id);
                        (goalInfoRes.body.name).should.equal(goal.name);
                        should.equal(goalInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Goal.remove().exec(done);
    });
  });
});

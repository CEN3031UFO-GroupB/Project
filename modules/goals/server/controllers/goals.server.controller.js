'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Goal = mongoose.model('Goal'),
  GoalsList = mongoose.model('GoalsList'),
  User = mongoose.model('User'),
  schedule = require('node-schedule'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash'),
  config = require(path.resolve('./config/env/development.js')),
  mailgun = require('mailgun-js')({ apiKey: config.mailGun.api_key, domain: 'sandboxb26a50f3d0844386a5071d5431553e72.mailgun.org' }),
  fs = require('fs');


function getThisMonday() {
  var d = new Date();
  var day = d.getDay();
  var diff = d.getDate() - day + (day == 0 ? -6:1);
  var monday = new Date(d.setDate(diff));
  return monday.setHours(0,0,0,0);
}

function getNextMonday() {
  var d = new Date();
  var day = d.getDay() + 1;
  var diff = d.getDate() + day + (day == 0 ? -6:1);
  var monday = new Date(d.setDate(diff));
  return monday.setHours(0,0,0,0);
}

/**
 * Create a Goal
 */
exports.create = function(req, res) {
  var goal = new Goal(req.body);
  goal.user = req.user;
  goal.status = 'Not Started';
  goal.week_timestamp = getThisMonday();
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
  GoalsList.findOneAndUpdate({ user: goal.user }, { $push: { goals: goal } }, { upsert: true }).exec(function(err,goal) {
    if(err) {
      console.log(err);
      return err;
    } else if(goal) {
      console.log(goal);
      return goal;
    }
  });
};

/**
 * Show the current Goal
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var goal = req.goal ? req.goal.toJSON() : {};
  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  goal.isCurrentUserOwner = req.user && goal.user && goal.user.toString() == req.user._id.toString();

  res.jsonp(goal);
};

/**
 * Update a Goal
 */
exports.update = function(req, res) {
  var goal = req.goal;

  goal = _.extend(goal, req.body);
  console.log('Attempting to update');

  if(goal.points){
    GoalsList.findOneAndUpdate({ user: goal.user}, {$inc: { points: goal.points } }).exec(function(err,goal) {
      if(err) {
        console.log(err);
        return err;
      } 
    });
  }
  GoalsList.findOneAndUpdate({ user: goal.user, 'goals._id': goal._id }, {'$set': { 'goals.$': goal } }).exec(function(err,goal) {
    if(err) {
      console.log(err);
      return err;
    } else if(goal) {
      console.log(goal);
      console.log('Successfully updated!');
      return goal;
    }
  });


};

/**
 * Delete a Goal
 */
exports.delete = function(req, res) {
  var goal = req.goal;
  console.log(JSON.stringify(goal));
  GoalsList.findOneAndUpdate({ user: goal.user }, { '$pull': { goals: { _id: goal._id } } }).exec(function(err,goal) {
    if(err) {
      console.log(err);
    } else if(goal) {
      res.json({ success: true, msg: 'Goal deleted' });
    }
  });
};

/**
 * List User's Goals
 */
exports.list = function(req, res) {

  GoalsList.find({ user: req.user
  }).populate('goals.user', 'displayName').exec(function(err, goalsList) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      if (goalsList[0] === undefined) {
        res.jsonp(goalsList);
      } else {
        res.jsonp(goalsList[0].goals);
      }
    }
  });
};

exports.goalsPoints = function(req, res) {
  GoalsList.find({ user: req.user
  }).populate('goals.user', 'displayName').exec(function(err, goalsList) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
        if (goalsList[0]) {
          var r = {_id: goalsList[0]._id, points: goalsList[0].points};
          res.jsonp(r);
        } else {
          // Need this in case goalslist does not exist
          // Client controller will try to update after a goal is created
          var r = {_id: 0, points: 0};
          res.jsonp(r);
        }
    }
  });
};
// TODO: make this actually update the points
exports.goalsPointsUpdate = function(req, res) {
  var goalPoints = req.body.goalPoints;
  console.log('Attempting to update Points');

  GoalsList.findOneAndUpdate({ _id: goalPoints._id}, {'$set': { points: goalPoints.points } }).exec(function(err,goalP) {
    if(err) {
      console.log('Failed to update points');
      return err;
    } else if(goalP) {
      console.log('Successfully updated points!');
      return res.jsonp(goalP);
    }
  });
};


/**
 * Goal middleware
 */
exports.goalByID = function(req, res, next, id) {

  console.log('Attempting to find goalById for ID:'+id);
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Goal is invalid'
    });
  }

  GoalsList.find({ 'goals._id': id }).populate('goals.user', 'displayName').exec(function (err, goal) {
    if (err) {
      return next(err);
    } else if (!goal) {
      return res.status(404).send({
        message: 'No Goal with that identifier has been found'
      });
    }
    req.goal = goal[0].goals.filter(function(el) {return el._id == id;})[0];
    next();
  });
};


/**
 * Get the current Notification setting
 */
exports.notificationsRead = function(req, res) {
  var notification = JSON.parse(fs.readFileSync(path.resolve('./modules/goals/server/data/notification.json')).toString());
  
  res.jsonp(notification);
};


/**
 * Update the current Notification setting
 */
exports.notificationsUpdate = function(req, res) {
  var notification = req.body;

  fs.writeFile(path.resolve('./modules/goals/server/data/notification.json'), JSON.stringify(notification), 'utf8', function() { });

  res.jsonp(notification);
};


//Update Notification time
var scheduleRule = new schedule.RecurrenceRule();
scheduleRule.minute = new schedule.Range(0, 59, 1);

//Function to run weekly, every Wednesday, to notify users of upcoming goals.
//Notifications will be sent via MailGun to the users' email.
//Cron-style scheduling: '* * 15 * * 3', i.e. every Wednesday at 3 pm.
var rule = new schedule.RecurrenceRule();
var notificationSettings = JSON.parse(fs.readFileSync(path.resolve('./modules/goals/server/data/notification.json')).toString());
rule.dayOfWeek = parseInt(notificationSettings.day);
rule.hour = parseInt(notificationSettings.time);
rule.minute = 0;

//TODO: Update rule dynamically
//Update scheduling time according to notifications settings
//var updateNotificationTime = schedule.scheduleJob(scheduleRule, function(){
//  var notificationSettings = JSON.parse(fs.readFileSync(path.resolve('./modules/goals/server/data/notification.json')).toString());
//  rule.dayOfWeek = parseInt(notificationSettings.day);
//  rule.hour = parseInt(notificationSettings.time);
//  rule.minute = 26;
//});

var weeklyGoalsNotifications = schedule.scheduleJob(rule, function(){
  console.log('Sending goal reminders!');	
  GoalsList.find({}).exec(function(error, goalslistObj) {
    var goalslist = goalslistObj;
	
    for(var i = 0; i < goalslist.length; i++) {
      
      var userId = mongoose.Types.ObjectId(goalslist[i]._doc.user.id).toString();
      (function(goalslistUser) {
        User.findById(userId, '-salt -password').exec(function (err, user) {
          var userObj = user._doc;
          var currentMonday = getThisMonday();

          if(goalslistUser._doc && goalslistUser._doc.goals.length > 0){
            var goalsToNotify = [];
            var goals = goalslistUser._doc.goals;

            for(var j = 0; j < goals.length; j++) {
              var goal = goals[j]._doc;

			  //Only check for goals which have not yet been completed
              if(goal.week_timestamp.getTime() === currentMonday && goal.status !== 'Complete')
                goalsToNotify.push(goal);
            }
			
            //If there are current goals, send an email
            if(goalsToNotify.length > 0) {
              console.log('Sending reminder to ' + userObj.email + '!');	
              var notificationSettings = JSON.parse(fs.readFileSync(path.resolve('./modules/goals/server/data/notification.json')).toString());
			  
              var body = notificationSettings.greeting + ' ' + userObj.displayName + ',\n';
              body += notificationSettings.body + '\n\n';
			  
              for(var k = 0; k < goalsToNotify.length; k++) {
                body += '- ' + goalsToNotify[k].title + ' (' + goalsToNotify[k].category + ')\n';
              }
			  
              body += '\n\n' + notificationSettings.ending;
			  
              var data = {
                from: 'Sandra Roach <mailgun@sandboxb26a50f3d0844386a5071d5431553e72.mailgun.org>',
                to: userObj.email,
                subject: 'Sandra Roach: Weekly Goal Reminder',
                text: body
              };

              mailgun.messages().send(data, function (error, body) {
                
              });
            }
          }
        });
      })(goalslist[i]);
    }
  });
});

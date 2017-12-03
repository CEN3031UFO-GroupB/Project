(function () {
  'use strict';

  angular
    .module('goals')
    .controller('GoalsListController', GoalsListController);

  GoalsListController.$inject = ['$scope', '$state', '$stateParams', 'Authentication', 'GoalsService', 'GoalsPointsService', 'PriorityService', 'PerformanceService', 'GoalsLimitService', 'Profiles', 'moment'];

  function GoalsListController($scope, $state, $stateParams, Authentication, GoalsService, GoalsPointsService, PriorityService, PerformanceService, GoalsLimitService, Profiles, moment) {

    var vm = this;
    vm.oldGoals = [];
    $scope.auth = Authentication;


    //Function to return the date at 00:00:00 of the current week's Monday
    function getThisMonday() {
      var d = new Date();
      var day = d.getDay();
      var diff = d.getDate() - day + (day == 0 ? -6:1);
      var monday = new Date(d.setDate(diff));
      monday.setHours(0, 0, 0, 0);
      return monday;
    }

    if ($scope.auth.user.roles[0] == 'admin') {
      $scope.name = $stateParams.userDisplayName.concat("'s");
      (function () {
        GoalsService.adminGoal.query({ userId: $stateParams.userId }).$promise.then(function (value) {
          vm.goals = value;
          var userId = '';
          if (vm.goals.length > 0) {
            userId = vm.goals[0].user._id;

            Profiles.get({ user: userId }, function (value) {
              $scope.userProfile = value;

              for (var i = 0; i < vm.goals.length; i++) {
                var priority = PriorityService.getPriority($scope.userProfile, vm.goals[i].category);
                vm.goals[i].priority = priority;
                if (vm.goals[i].completed_at) {
                  if (new Date(vm.goals[i].completed_at).getTime() < getThisMonday().getTime()) {
                    vm.oldGoals.push(vm.goals[i]);
                  }
                }
              }
              vm.performanceData = PerformanceService.getPerformance(vm.goals);
              $scope.labels = vm.performanceData.weeks;
              $scope.series = ['Completed', 'Started'];
              $scope.data = [vm.performanceData.finishes, vm.performanceData.starts];
              $scope.type = 'line';

            });
          }
        });
      })();
    } else {
      $scope.name = 'My';
      //Add priorities to goals
      (function () {
        GoalsService.Goal.query().$promise.then(function (value) {
          vm.goals = value;
          var userId = '';

          if (vm.goals.length > 0) {
            userId = vm.goals[0].user._id;

            Profiles.get({ user: userId }, function (value) {
              $scope.userProfile = value;

              for (var i = 0; i < vm.goals.length; i++) {
                var priority = PriorityService.getPriority($scope.userProfile, vm.goals[i].category);
                vm.goals[i].priority = priority;
                if (vm.goals[i].completed_at) {
                  if (new Date(vm.goals[i].completed_at).getTime() < getThisMonday().getTime()) {
                    vm.oldGoals.push(vm.goals[i]);
                  }
                }
              }
              vm.performanceData = PerformanceService.getPerformance(vm.goals);
              $scope.labels = vm.performanceData.weeks;
              $scope.series = ['Completed', 'Started'];
              $scope.data = [vm.performanceData.finishes, vm.performanceData.starts];
              $scope.type = 'line';

            });
          }
        });
      })();
    }
    
    function updatePoints(){
      GoalsPointsService.get().$promise.then(function(value) {
        vm.goalPoints = { goalPoints: { _id: value._id, points: value.points } };
        vm.points = vm.goalPoints.goalPoints.points;
      });
    };
    updatePoints();

      //Chart options
    $scope.options = {
      legend: {
        display: true,
        position: 'right',
      },
      responsive: true,
      scales: {
        xAxes: [{
          //stacked: true,
          type: 'time',
          distribution: 'linear',
          time: {
            displayFormats: {
              week: 'MM-DD-YYYY'
            },
            isoWeekday: true,
            unit: 'week',
            tooltipFormat: 'MM-DD-YYYY',
            max: getThisMonday(),
          }
        }],
        yAxes: [{
          //stacked: true,
          ticks:{
            min: 0,
            fixedStepSize: 1,
          }
        }],
        bounds: 'ticks',
      }
    };

    $scope.monday = getThisMonday();
    var today = new Date();
    var timeDiff = Math.abs(today.getTime() - $scope.monday.getTime());
    $scope.diffDays = 8 - Math.ceil(timeDiff / (1000 * 3600 * 24));
    $scope.pluralDay = $scope.diffDays === 1 ? '' : 's';

      //CSS to be applied to the To Do goals column via ng-style to accommodate for longer titles
    $scope.todoCSS = function (goal) {
      if (goal.title.length <= 24) {
        return { 'border-right': '65px solid #505050',
          'padding-left': '10px',
          'margin-left': '-55px', };
      } else {
        return { 'border-right': '69px solid #505050',
          'padding-left': '14px',
          'margin-left': '-63px', };
      }
    };

    //CSS to be applied to the In Prog goals column via ng-style to accommodate for longer titles
    $scope.inProgressCSS = function (goal) {
      if (goal.title.length <= 24) {
        return { 'border-right': '65px solid #347fa5',
          'padding-left': '10px',
          'margin-left': '-55px', };
      } else {
        return { 'border-right': '69px solid #347fa5',
          'padding-left': '14px',
          'margin-left': '-63px', };
      }
    };

    //CSS to be applied to the Completed goals column via ng-style to accommodate for longer titles
    $scope.completedCSS = function (goal) {
      if (goal.title.length <= 24) {
        return { 'border-right': '60px solid #30bb00',
          'padding-left': '5px',
          'margin-left': '-45px', };
      } else {
        return { 'border-right': '69px solid #30bb00',
          'padding-left': '15px',
          'margin-left': '-65px', };
      }
    };


    $scope.status = ['Complete', 'In Progress', 'Not Started'];

    $scope.createGoal = function () {
      $state.go('goals.create');
    };

    $scope.markGoalInProgress = function (goal) {
      GoalsService.Goal.query().$promise.then(function (value) {
        if (GoalsLimitService.canAddInProgress(value)) {
          goal.status = 'In Progress';
          goal.started_at = new Date();
          console.log(JSON.stringify(goal));
          GoalsService.Goal.update(goal);
        } else {
          alert('Sorry, but you can only have 5 goals in progress!');
        }
      });

    };

    $scope.markGoalComplete = function (goal) {
      var numPoints = 3;
      var p = goal.priority;
      if(p === 'Support'){
        numPoints = 4;
      } else if(p === 'Maintenance'){
        numPoints = 3;
      } else if(p === 'Cut/Shift'){
        numPoints = 2;
      } else if(p === 'Minimize'){
        numPoints = 1;
      }

      goal.status = 'Complete';
      goal.completed_at = new Date();
      console.log(JSON.stringify(goal));
      GoalsService.Goal.update(goal);

      // Increment user's points
      vm.goalPoints.goalPoints.points += numPoints;
      GoalsPointsService.update(vm.goalPoints);
      vm.points += numPoints;
      console.log(JSON.stringify(vm.goalPoints));
    };

  }
}());

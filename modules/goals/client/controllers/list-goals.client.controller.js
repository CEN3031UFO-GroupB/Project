(function () {
  'use strict';

  angular
    .module('goals')
    .controller('GoalsListController', GoalsListController);

  GoalsListController.$inject = ['$scope', '$state', '$window', 'Authentication', 'GoalsService', 'PriorityService', 'PerformanceService', 'Profiles'];

  function GoalsListController($scope, $state, $window, Authentication, GoalsService, PriorityService, PerformanceService, Profiles) {
    var vm = this;
    vm.oldGoals = [];

    function getThisMonday() {
      var d = new Date();
      var day = d.getDay();
      var diff = d.getDate() - day + (day == 0 ? -6:1);
      var monday = new Date(d.setDate(diff));
      monday.setHours(0, 0, 0, 0);
      return monday;
    }

	//Add priorities to goals
    (function() {
      GoalsService.query().$promise.then(function(value) {
        vm.goals = value;
        var userId = '';

        PerformanceService.getPerformance(vm.goals);

        if(vm.goals.length > 0)
        {				
          userId = vm.goals[0].user._id;

          Profiles.get({ user: userId }, function(value) {
            $scope.userProfile = value;

            for(var i = 0; i < vm.goals.length; i++) {
              var priority = PriorityService.getPriority($scope.userProfile, vm.goals[i].category);
              vm.goals[i].priority = priority;
              if(vm.goals[i].completed_at){
                if(new Date(vm.goals[i].completed_at).getTime() < getThisMonday().getTime()){
                  vm.oldGoals.push(vm.goals[i]);
                }
              }
            }
          });
        }
      });
    })();


    $scope.monday = getThisMonday();
    var today = new Date();
    var timeDiff = Math.abs(today.getTime() - $scope.monday.getTime());
    $scope.diffDays = 7 - Math.ceil(timeDiff / (1000 * 3600 * 24));


    $scope.status = ['Complete', 'In Progress', 'Not Started'];

    $scope.createGoal = function () {
      $state.go('goals.create');
    };

    $scope.markGoalInProgress = function (goal) {
      goal.status = 'In Progress';
      goal.started_at = new Date();
      console.log(JSON.stringify(goal));
      GoalsService.update(goal);
    };

    $scope.markGoalComplete = function (goal) {
      goal.status = 'Complete';
      goal.completed_at = new Date();
      console.log(JSON.stringify(goal));
      GoalsService.update(goal);
    };

  }
}());

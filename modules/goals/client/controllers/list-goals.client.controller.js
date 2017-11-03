(function () {
  'use strict';

  angular
    .module('goals')
    .controller('GoalsListController', GoalsListController);

  GoalsListController.$inject = ['$scope', '$state', '$window', 'Authentication', 'GoalsService'];

  function GoalsListController($scope, $state, $window, Authentication, GoalsService) {
    var vm = this;
    vm.goals = GoalsService.query();

    function getThisMonday () {
      var d = new Date();
      var day = d.getDay();
      var diff = d.getDate() - day + (day == 0 ? -6:1);
      var monday = new Date(d.setDate(diff));
      monday.setHours(0, 0, 0, 0)
      return monday;
    }
    $scope.monday = getThisMonday();

    $scope.status = ['Complete', 'In Progress', 'Not Started'];

     $scope.createGoal = function () {
      $state.go('goals.create');
    }

    $scope.markGoalInProgress = function (goal) {
      goal.status = 'In Progress';
      console.log(JSON.stringify(goal));
      GoalsService.update(goal);
    }

    $scope.markGoalComplete = function (goal) {
      goal.status = 'Complete';
      console.log(JSON.stringify(goal));
      GoalsService.update(goal);
    }

  }
}());

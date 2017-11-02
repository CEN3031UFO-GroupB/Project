(function () {
  'use strict';

  angular
    .module('goals')
    .controller('GoalsListController', GoalsListController);

  GoalsListController.$inject = ['$scope', '$state', '$window', 'Authentication', 'GoalsService'];

  function GoalsListController($scope, $state, $window, Authentication, GoalsService) {
    var vm = this;
    $scope.status = ['Complete', 'In Progress', 'Not Started'];
    vm.goals = GoalsService.query();
  }
}());

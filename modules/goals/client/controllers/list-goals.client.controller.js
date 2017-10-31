(function () {
  'use strict';

  angular
    .module('goals')
    .controller('GoalsListController', GoalsListController);

  GoalsListController.$inject = ['GoalsService'];

  function GoalsListController(GoalsService) {
    var vm = this;

    vm.goals = GoalsService.query();
  }
}());

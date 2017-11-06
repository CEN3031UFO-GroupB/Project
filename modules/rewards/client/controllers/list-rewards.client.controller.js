(function () {
  'use strict';

  angular
    .module('rewards')
    .controller('RewardsListController', RewardsListController);

  RewardsListController.$inject = ['RewardsService', 'Authentication'];

  function RewardsListController(RewardsService, Authentication) {
    var vm = this;
    vm.authentication = Authentication;

    vm.rewards = RewardsService.query();

  }
}());

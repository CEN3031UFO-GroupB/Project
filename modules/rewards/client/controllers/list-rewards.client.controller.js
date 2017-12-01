(function () {
  'use strict';

  angular
    .module('rewards')
    .controller('RewardsListController', RewardsListController);

  RewardsListController.$inject = ['RewardsService', 'PagerService', 'Authentication', 'filterFilter', 'GoalsPointsService'];

  function RewardsListController(RewardsService, PagerService, Authentication, filterFilter, GoalsPointsService) {
    var vm = this;
    vm.authentication = Authentication;
    vm.rewards = RewardsService.query(function(){
      vm.setPageClaimed(1);
    });
    vm.claimedPager = {};
    vm.setPageClaimed = setPageClaimed;

    function setPageClaimed(page) {
      if (page < 1 || page > vm.claimedPager.totalPages) {
          return;
      }
      var pageSize = 5;
      vm.claimedRewards = filterFilter(vm.rewards, {claimed: true});
      // get pager object from service
      vm.claimedPager = PagerService.GetPager(vm.claimedRewards.length, page, pageSize);

      // get current page of items
      vm.claimedItems = vm.claimedRewards.slice(vm.claimedPager.startIndex, vm.claimedPager.endIndex + 1);
    }

    function getPoints(){
        GoalsPointsService.get({user: vm.authentication.user._id}, function(value){
          vm.goalPoints = { goalPoints: {_id: value._id, points: value.points} };
          vm.points = vm.goalPoints.goalPoints.points;
        });
    };
    getPoints();




  }
}());

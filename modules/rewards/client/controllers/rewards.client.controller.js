(function () {
  'use strict';

  // Rewards controller
  angular
    .module('rewards')
    .controller('RewardsController', RewardsController);

  RewardsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'rewardResolve', 'GoalsPointsService'];

  function RewardsController ($scope, $state, $window, Authentication, reward, GoalsPointsService) {
    var vm = this;

    vm.authentication = Authentication;
    vm.reward = reward;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;
    vm.claim = claim;

    // Remove existing Reward
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.reward.$remove($state.go('rewards.list'));
      }
    }

    function claim() {
      if(vm.reward.points > vm.goalPoints.goalPoints.points){
        vm.error = 'You don\'t have enough points to claim this rewards.';
        return;
      } else {
        vm.reward.claimed = true;
        vm.reward.claimed_on = Date.now();
        vm.reward.$update(rewardUpdateSuccess, errorCallback);

        function rewardUpdateSuccess(res){
          vm.goalPoints.goalPoints.points -= vm.reward.points;
          GoalsPointsService.update(vm.goalPoints, successCallback);
        }

        function successCallback(res) {
          $state.go('rewards.list', {
            rewardId: res._id
          });
        }

        function errorCallback(res) {
          vm.error = res.data.message;
        }
      }
    }

    // Save Reward
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.rewardForm');
        return false;
      }

      if (vm.reward._id) {
        vm.reward.$update(successCallback, errorCallback);
      } else {
        vm.reward.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('rewards.list');
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
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

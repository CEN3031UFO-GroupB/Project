(function () {
  'use strict';

  // Goals controller
  angular
    .module('goals')
    .controller('GoalsController', GoalsController);

  GoalsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'goalResolve'];

  function GoalsController ($scope, $state, $window, Authentication, goal) {
    var vm = this;

    vm.authentication = Authentication;
    vm.goal = goal;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    //Hard-coded categories. TODO: move them from the profiles controller into an injectable service
    $scope.categories = ['Family', 'Health', 'Rest and Relaxation', 'Faith', 'Finance', 'Romance', 'Friends',
                          'Contribution','Personal Growth', 'Career', 'Physical Environment'];

    // Remove existing Goal
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.goal.$remove($state.go('goals.list'));
      }
    }

    // Save Goal
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.goalForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.goal._id) {
        vm.goal.$update(successCallback, errorCallback);
      } else {
        vm.goal.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('goals.view', {
          goalId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());

'use strict';

angular.module('core').controller('HeaderController', ['$scope', '$state', 'Authentication', 'Menus',
  function ($scope, $state, Authentication, Menus) {
    // Expose view variables
    $scope.$state = $state;
    $scope.authentication = Authentication;

    // Get the topbar menu
    $scope.menu = Menus.getMenu('topbar');

    // Toggle the menu items
    $scope.isCollapsed = false;
    $scope.toggleCollapsibleMenu = function () {
      $scope.isCollapsed = !$scope.isCollapsed;
    };

    // Collapsing the menu after navigation
    $scope.$on('$stateChangeSuccess', function () {
      $scope.isCollapsed = false;
    });

    //function to route user/admin to home depending on role
    $scope.homeRoute = function () {
      if ($scope.authentication.user.roles[0] === 'admin') {
        console.log('admin!');
        $state.go('admin.users', $state.previous.params);
      } else {
        $state.go('goals.list', $state.previous.params);
      }
    }
  }
]);

(function () {
  'use strict';

  // Notifications controller
  angular
    .module('goals')
    .controller('NotificationsController', GoalsController);

  NotificationsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'goalResolve'];

  function NotificationsController ($scope, $state, $window, Authentication, goal) {
	  
    }
  }
}());

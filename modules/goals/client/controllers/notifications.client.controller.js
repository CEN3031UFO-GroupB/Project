'use strict';

angular.module('goals').controller('NotificationsController', ['$scope', '$stateParams', '$location', 'Authentication', 'NotificationsService',
    function ($scope, $stateParams, $location, Authentication, NotificationsService) {
      $scope.authentication = Authentication;
      $scope.notification = {};
      $scope.notification.day = 5;
      $scope.notification.time = 18;
      $scope.notification.description = 'test description';
      $scope.notification.ending = 'test ending';

      $scope.update = function() {
        debugger;

        NotificationsService.update($scope.notification);
      };
    }
]);
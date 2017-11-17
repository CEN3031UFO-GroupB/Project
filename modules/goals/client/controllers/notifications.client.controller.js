'use strict';

angular.module('goals').controller('NotificationsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Notifications',
    function ($scope, $stateParams, $location, Authentication, Notifications) {
      $scope.authentication = Authentication;
      $scope.notification = {};
	  $scope.message = '';

      $scope.load = function() {
        var notification = Notifications.read()
          .then(function (response) {
            $scope.notification = response.data;
          }, function (error) {

          });
      };

      $scope.update = function(isValid) {
        if (!isValid) {
          $scope.$broadcast('show-errors-check-validity', 'updateForm');
          return false;
        }
	  
        Notifications.update($scope.notification)
		  .then(function (response) {
            $scope.message = 'Update was successful!';
			$scope.messageClass = "success";
		  }, function (error) {
            $scope.message = 'An error occured!';
			$scope.messageClass = "error";
          });
      };
    }
]);
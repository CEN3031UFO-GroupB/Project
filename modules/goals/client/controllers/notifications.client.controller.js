'use strict';

angular.module('goals').controller('NotificationsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Notifications',
    function ($scope, $stateParams, $location, Authentication, Notifications) {
      $scope.authentication = Authentication;
      $scope.notification = {};
      $scope.message = '';

	  //Function to load current notifications settings
      $scope.load = function() {
        var notification = Notifications.read()
          .then(function (response) {
            $scope.notification = response.data;
          }, function (error) {

          });
      };

	  //Function to update notifications settings for the entire application
	  //depending on the user's input
      $scope.update = function(isValid) {
		  
		//If the form is not valid, display all errors within the view
        if (!isValid) {
          $scope.$broadcast('show-errors-check-validity', 'updateForm');
          return false;
        }
	  
        Notifications.update($scope.notification).then(function (response) {
          $scope.message = 'Update was successful!';
          $scope.messageClass = 'success';
        }, function (error) {
          $scope.message = 'An error occured!';
          $scope.messageClass = 'error';
        });
      };
    }
]);
'use strict';

angular.module('verifications').controller('VerificationsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Verifications',
    function ($scope, $stateParams, $location, Authentication, Verifications) {
      $scope.authentication = Authentication;
      $scope.code = '';
      $scope.codeCreate = '';

      $scope.CheckVerification = function () {
        var code = $scope.code;

        Verifications.read(code)
          .then(function (response) {
            $scope.errorMsg = '';
            $scope.verification = response.data;
		    
            //Update the verification code to inactive in the db, and add the userId
            Verifications.update(response.data.code, {
              'verification': {
                'code': response.data.code,
                'user_id': $scope.authentication.user._id,
                'active': false
              }
            })
			.then(function (response) {
              //Success
			}, function (error) {
              //Error
			});
          }, function (error) {
            $scope.errorMsg = 'Invalid code "' + code;
          });
      };
		
      $scope.CreateVerification = function () {
        Verifications.create({
          'code': $scope.codeCreate,
          'user_id': '',
          'active': true,
          'created_at': new Date()
        })
        .then(function (response) {
          //Success
        }, function (error) {
          //Error
        });
      };
    }
]);

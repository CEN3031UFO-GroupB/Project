'use strict';

angular.module('verifications').controller('VerificationsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Verifications', 'Admin',
    function ($scope, $stateParams, $location, Authentication, Verifications, Admin) {
      $scope.authentication = Authentication;
      $scope.code = '';
      $scope.codeCreate = '';
	  
      $scope.buildPager = function () {
        $scope.itemsPerPage = 15;
        $scope.currentPage = 1;
		$scope.ListVerifications();
      };
	  
      Admin.query(function (data) {
        $scope.users = data;
        $scope.buildPager();
      });
	  
	  $scope.figureOutItemsToDisplay = function () {
		  $scope.itemLength = $scope.veriList.length;
        var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
        var end = begin + $scope.itemsPerPage;
        $scope.pagedItems = $scope.veriList.slice(begin, end);
    };

    $scope.pageChanged = function () {
      $scope.figureOutItemsToDisplay();
    };

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
		
      $scope.CreateUserVerification = function () {
        $scope.codeCreate = Math.random().toString(36).substring(6);
		
        Verifications.create({ 'code': $scope.codeCreate, 'user_id': '-1', 'active': true, 'created_at': new Date(), 'type': 'user'
		})
		.then(function (response) { 
		$scope.codeCreate = '';
		$scope.ListVerifications();
		}, function (error) {
			
		});
      };
	  
	  $scope.CreateAdminVerification = function () {
        $scope.codeCreate = Math.random().toString(36).substring(6);
		
        Verifications.create({ 'code': $scope.codeCreate, 'user_id': '-1', 'active': true, 'created_at': new Date(), 'type': 'admin'
		})
		.then(function (response) { 
		$scope.codeCreate = '';
		$scope.ListVerifications();
		}, function (error) {
			
		});
      };
	  
      $scope.ListVerifications = function () {
        Verifications.list().then(function (response) { 
		$scope.veriList = response.data;
		for(var i = 0; i < $scope.veriList.length; i++){
			if($scope.veriList[i].user_id !== '-1' && $scope.veriList[i].user_id !== ''){
				var index = $scope.users.findIndex(x => x._id === $scope.veriList[i].user_id);

                if(index && index != '-1')
                  $scope.veriList[i].user_id = $scope.users[index].displayName;
			}
			else
                $scope.veriList[i].user_id = '';
		}
        $scope.figureOutItemsToDisplay();
        }, function (error) {
        });
      };
    }
]);

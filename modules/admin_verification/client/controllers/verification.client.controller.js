'use strict';

angular.module('verifications').controller('VerificationsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Verifications', 'Admin',
    function ($scope, $stateParams, $location, Authentication, Verifications, Admin) {
      $scope.authentication = Authentication;
      $scope.code = '';
      $scope.codeCreate = '';
	  
	  //Function to build the pagination for the table
      $scope.buildPager = function () {
        $scope.itemsPerPage = 15;
        $scope.currentPage = 1;
		$scope.ListVerifications();
      };
	  
      Admin.query(function (data) {
        $scope.users = data;
        $scope.buildPager();
      });
	  
	  //Function to get the collection of items to display
	  $scope.figureOutItemsToDisplay = function () {
		$scope.itemLength = $scope.veriList.length;
        var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
        var end = begin + $scope.itemsPerPage;
        $scope.pagedItems = $scope.veriList.slice(begin, end);
      };

      $scope.pageChanged = function () {
        $scope.figureOutItemsToDisplay();
      };

	  //Function to check if the verification code is valid and active.
	  //If it is active, inactivate the code.
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
      
	  //Function to create a new user verification code and store it in the database
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
	  
      //Function to create a new admin verification code and store it in the database
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
	  
	  //Function to get retrieve codes
      $scope.ListVerifications = function () {
        Verifications.list().then(function (response) { 
		$scope.veriList = response.data;

		//Filter by active
		if($scope.checkboxActive) {
          $scope.veriList = $scope.veriList.filter(function(code){
            return code.active !== false;
          });
		}
		
		//Sort by date
        $scope.veriList.sort(function(a, b) { 
          return new Date(b.created_at) - new Date(a.created_at);
        });

		for(var i = 0; i < $scope.veriList.length; i++){
			if($scope.veriList[i].user_id !== '-1' && $scope.veriList[i].user_id !== ''){
				var index = $scope.users.findIndex(x => x._id === $scope.veriList[i].user_id);

                if(index && index != '-1')
                  $scope.veriList[i].user_id = $scope.users[index].displayName;
                else
                  $scope.veriList[i].user_id = '';
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

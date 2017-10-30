'use strict';

angular.module('profiles').controller('AdminProfile', ['$scope', '$stateParams', 'Authentication', 'Profiles',
  function ($scope, $stateParams, Authentication, Profiles) {
    $scope.authentication = Authentication;
	
    $scope.currentProfile = Profiles.get(
      { user: $stateParams.userId },
      function(prof) {
        $scope.profile = prof;
        console.log(JSON.stringify($scope.profile));
        $scope.prioritiesArray = [];
        angular.forEach($scope.profile.Priority[0], function(value,key) {
          if(key !== '_id'){
            $scope.prioritiesArray.push({
              name: key.replace('_', ' ').replace('_', ' '),
              rank: value
            });
          }
        });
      }
    );
  }
]);

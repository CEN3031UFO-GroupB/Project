'use strict';

angular.module('profiles').controller('AdminProfile', ['$scope', '$stateParams', 'Authentication', 'Profiles',
  function ($scope, $stateParams, Authentication, Profiles) {
    $scope.authentication = Authentication;
	
    $scope.currentProfile = Profiles.get(
      { user: $stateParams.userId },
      function(prof) {
        $scope.prioritiesArray = [];
        angular.forEach(prof.Priority[0], function(value,key) {
          if(key !== '_id'){
            $scope.prioritiesArray.push({
              name: key.replace('_', ' ').replace('_', ' '),
              rank: value
            });
          }
        });
		$scope.Satisfaction = prof.Satisfaction[0];
		$scope.user = prof.user.displayName;
      }
    );
  }
]);

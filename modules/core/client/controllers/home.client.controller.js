'use strict';

angular.module('core').controller('HomeController', ['$scope', '$state', 'Authentication', 'Profiles',
  function ($scope, $state, Authentication, Profiles) {
    // This provides Authentication context.
    $scope.authentication = Authentication;
	
	//Redirect to login if user is not logged in
    (function () {
      if(!$scope.authentication.user)
        $state.go('authentication.signin', $state.previous.params);
    })();
  
	//Redirect to profile creation if user has not created a profile
    (function () {
      var profile = Profiles.get({
        user: $scope.authentication.user._id
      }, function(profile, response){
        if(!profile._id)
          $state.go('profile.create', $state.previous.params);
      });
    })();
  }]);
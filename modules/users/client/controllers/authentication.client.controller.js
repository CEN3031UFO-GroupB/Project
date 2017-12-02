'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$state', '$http', '$location', '$window', 'Authentication', 'PasswordValidator','Verifications', 'Profiles',
  function ($scope, $state, $http, $location, $window, Authentication, PasswordValidator, Verifications, Profiles) {
    $scope.authentication = Authentication;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();

    // Get an eventual error defined in the URL query string:
    $scope.error = $location.search().err;

    // If user is signed in then redirect back home
    if ($scope.authentication.user) {
      $location.path('/');
    }

    $scope.signup = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');
        return false;
      }

      Verifications.read($scope.credentials.registrationKey).then(function (response) {
        $scope.errorMsg = '';
        $scope.verification = response.data;
        $scope.credentials.roles = response.data.type;
        $http.post('/api/auth/signup', $scope.credentials).success(function (response) {
          // If successful we assign the response to the global user model
          $scope.authentication.user = response;
          //Once response is back, update the verification code in the DB to be inactive and assigned to the user
          Verifications.update(response.registrationKey, {
            'verification': {
              'code': response.registrationKey,
              'user_id': $scope.authentication.user._id,
              'active': false
            }
          }).then(function (response) {
                //Success
          }, function (error) {
               //Error
          });
          // And redirect to the profile creation page upon signup IF USER else Admin Dashboard
          if($scope.authentication.user.roles[0] === 'user'){
            $state.go('profile.create', $state.previous.params);
          }
          else{
            $state.go('admin.users', $state.previous.params);
          }
        }).error(function (response) {
          $scope.error = response.message;
        });
      }, function (error) {
        $scope.error = 'Invalid Registration Code "' + $scope.credentials.registrationKey + '"';
        return false;
      });
    };

    $scope.signin = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      $http.post('/api/auth/signin', $scope.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;

        // And redirect to the previous or home page
        if ($scope.authentication.user.roles[0] === 'user') {
          Profiles.get({ user: response._id }, function(result){
            if(result.Priority)
              $state.go('goals.list', $state.previous.params);
            else
              $state.go('profile.create', $state.previous.params);
          });
        } else {
          $state.go('admin.users', $state.previous.params);
        }
      }).error(function (response) {
        $scope.error = response.message;
      });
    };

    // OAuth provider request
    $scope.callOauthProvider = function (url) {
      if ($state.previous && $state.previous.href) {
        url += '?redirect_to=' + encodeURIComponent($state.previous.href);
      }

      // Effectively call OAuth authentication route:
      $window.location.href = url;
    };
  }
]);

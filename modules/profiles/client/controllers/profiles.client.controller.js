'use strict';

angular.module('profiles').controller('ProfilesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Profiles',
  function ($scope, $stateParams, $location, Authentication, Profiles) {
    $scope.authentication = Authentication;

    // Create new Profile
    $scope.create = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'profileForm');

        return false;
      }

      // Create new Profile object
      var profile = new Profiles({
        Priority: {
          Family: this.Family,
          Health: this.Health,
          Rest_and_Relaxation: this.Rest_and_Relaxation,
          Faith: this.Faith,
          Finance: this.Finance,
          Romance: this.Romance,
          Friends: this.Friends,
          Contribution: this.Contribution,
          Security: this.Security,
          Personal_Growth: this.Personal_Growth
        },
        Satisfaction: {
          Personal_Growth: this.Personal_Growth,
          Career: this.Career,
          Family_and_Friends: this.Family_and_Friends,
          Health: this.Health,
          Physical_Env: this.Physical_Env,
          Romance: this.Romance,
          Money: this.Money,
          Fun: this.Fun
        }
      });

      // Redirect after save
      profile.$save(function (response) {
        $location.path('profiles/' + response._id);

        // Clear form fields
        $scope.title = '';
        $scope.content = '';
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Delete a profile
    $scope.remove = function (profile) {
      if (profile) {
        profile.$remove();

      } else {
        $scope.profile.$remove(function () {
          $location.path('profile');
        });
      }
    };

    // Update existing Profile
    $scope.update = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'profileForm');

        return false;
      }

      var profile = $scope.profile;

      profile.$update(function () {
        $location.path('profiles/' + profile._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Find a list of Profiles
    $scope.find = function () {
      $scope.profiles = Profiles.list();
    };

    // Find existing profile
    $scope.findOne = function () {
      $scope.profile = Profiles.get({
        profileId: $stateParams.profileId
      });
    };
  }
]);

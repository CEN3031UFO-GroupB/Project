'use strict';

angular.module('profiles').controller('ProfilesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Profiles',
  function ($scope, $stateParams, $location, Authentication, Profiles) {
    $scope.authentication = Authentication;

    var clearForm = function(){
      $scope.Personal_Growth = null;
      $scope.Career = null;
      $scope.Family_and_Friends = null;
      $scope.Health = null;
      $scope.Physical_Env = null;
      $scope.Romance = null;
      $scope.Money = null;
      $scope.Fun = null;
      $scope.Family = null;
      $scope.Health = null;
      $scope.Rest_and_Relaxation = null;
      $scope.Faith = null;
      $scope.Finance = null;
      $scope.Romance = null;
      $scope.Friends = null;
      $scope.Contribution = null;
      $scope.Security = null;
      $scope.Personal_Growth = null;
    };
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
        $location.path('profile/view');

        // Clear form fields
        clearForm();
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
        $location.path('profiles/view');
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Find a list of Profiles
    $scope.find = function () {
      $scope.profiles = Profiles.list();
    };

    // Find the current user's profile
    $scope.findOne = function () {
      $scope.profile = Profiles.get({
        user: $scope.authentication.user._id
      });
    };


    $scope.test_create = function () {
      $scope.error = null;


      // Create new Profile object
      var profile = new Profiles({
        Priority: {
          Family: 1,
          Health: 2,
          Rest_and_Relaxation: 3,
          Faith: 4,
          Finance: 5,
          Romance: 6,
          Friends: 7,
          Contribution: 8,
          Security: 9,
          Personal_Growth: 10
        },
        Satisfaction: {
          Personal_Growth: 5,
          Career: 5,
          Family_and_Friends: 5,
          Health: 5,
          Physical_Env: 6,
          Romance: 5,
          Money: 5,
          Fun: 5
        }
      });

      // Redirect after save
      profile.$save(function (response) {
        $location.path('profile/view');

        // Clear form fields
        clearForm();
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
        console.log($scope.error);
      });
    };




  }
]);

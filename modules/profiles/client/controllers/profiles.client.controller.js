'use strict';

angular.module('profiles').controller('ProfilesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Profiles',
    function ($scope, $stateParams, $location, Authentication, Profiles) {
        $scope.authentication = Authentication;
        $scope.profile = {
            priorities: [
                {
                    name: 'Family'
                },
                {
                    name: 'Health'
                },
                {
                    name: 'Rest and Relaxation'
                },
                {
                    name: 'Faith'
                },
                {
                    name: 'Finance'
                },
                {
                    name: 'Romance'
                },
                {
                    name: 'Friends'
                },
                {
                    name: 'Contribution'
                },
                {
                    name: 'Security'
                },
                {
                    name: 'Personal Growth'
                }
            ],
			satisfactions: [
			    {
                    name: 'Personal Growth'
                },
                {
                    name: 'Career'
                },
                {
                    name: 'Family and Friends'
                },
                {
                    name: 'Health'
                },
                {
                    name: 'Physical Env'
                },
                {
                    name: 'Romance'
                },
                {
                    name: 'Money'
                },
                {
                    name: 'Fun'
                },
			]
        };

        // Create new Profile
        $scope.CreateProfile = function () {
            $scope.error = null;

            // Create new Profile object
            var profile = new Profiles({
                Priority: {
                    Family: $scope.profile.priorities.findIndex(x => x.name === "Family") + 1,
                    Health: $scope.profile.priorities.findIndex(x => x.name === "Health") + 1,
                    Rest_and_Relaxation: $scope.profile.priorities.findIndex(x => x.name === "Rest and Relaxation") + 1,
                    Faith: $scope.profile.priorities.findIndex(x => x.name === "Faith") + 1,
                    Finance: $scope.profile.priorities.findIndex(x => x.name === "Finance") + 1,
                    Romance: $scope.profile.priorities.findIndex(x => x.name === "Romance") + 1,
                    Friends: $scope.profile.priorities.findIndex(x => x.name === "Friends") + 1,
                    Contribution: $scope.profile.priorities.findIndex(x => x.name === "Contribution") + 1,
                    Security: $scope.profile.priorities.findIndex(x => x.name === "Security") + 1,
                    Personal_Growth: $scope.profile.priorities.findIndex(x => x.name === "Personal Growth") + 1
                },
                Satisfaction: {
                    Personal_Growth: $scope.profile.satisfactions.findIndex(x => x.name === "Personal Growth") + 1,
                    Career: $scope.profile.satisfactions.findIndex(x => x.name === "Career") + 1,
                    Family_and_Friends: $scope.profile.satisfactions.findIndex(x => x.name === "Family and Friends") + 1,
                    Health: $scope.profile.satisfactions.findIndex(x => x.name === "Health") + 1,
                    Physical_Env: $scope.profile.satisfactions.findIndex(x => x.name === "Physical Env") + 1,
                    Romance: $scope.profile.satisfactions.findIndex(x => x.name === "Romance") + 1,
                    Money: $scope.profile.satisfactions.findIndex(x => x.name === "Money") + 1,
                    Fun: $scope.profile.satisfactions.findIndex(x => x.name === "Fun") + 1
                }
            });
						
            // Redirect after save
            profile.$save(function (response) {
                $location.path('profile/view');

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
                $scope.title = '';
                $scope.content = '';
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
                console.log($scope.error);
            });
        };




    }
]);

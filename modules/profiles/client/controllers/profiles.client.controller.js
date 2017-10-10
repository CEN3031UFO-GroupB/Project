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
			satisfactions: {
				personalGrowth: 5,
				career: 5,
				familyAndFriends: 5,
				health: 5,
				physicalEnv: 5,
				romance: 5,
				money: 5,
				fun: 5
			}
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
                    Personal_Growth: $scope.profile.satisfactions.personalGrowth,
                    Career: $scope.profile.satisfactions.career,
                    Family_and_Friends: $scope.profile.satisfactions.familyAndFriends,
                    Health: $scope.profile.satisfactions.health,
                    Physical_Env: $scope.profile.satisfactions.physicalEnv,
                    Romance: $scope.profile.satisfactions.romance,
                    Money: $scope.profile.satisfactions.money,
                    Fun: $scope.profile.satisfactions.fun
                }
            });
						
            // Redirect after save
            profile.$save(function (response) {
                $location.path('profile/view');

            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };


        // Update existing Profile
        $scope.update = function () {
            $scope.error = null;

            var profile = $scope.currentProfile;
            profile.Priority = {
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
            };
            profile.Satisfaction = {
                Personal_Growth: $scope.profile.satisfactions.personalGrowth,
                Career: $scope.profile.satisfactions.career,
                Family_and_Friends: $scope.profile.satisfactions.familyAndFriends,
                Health: $scope.profile.satisfactions.health,
                Physical_Env: $scope.profile.satisfactions.physicalEnv,
                Romance: $scope.profile.satisfactions.romance,
                Money: $scope.profile.satisfactions.money,
                Fun: $scope.profile.satisfactions.fun
            };

            profile.$update(function () {
                $location.path('profile/view');
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });


        };

        // Find the current user's profile
        $scope.findOne = function () {
            $scope.currentProfile = Profiles.get({
                user: $scope.authentication.user._id
            });
        };


    }
]);

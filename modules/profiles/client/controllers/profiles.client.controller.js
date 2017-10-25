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
            if(confirm("You will not be able to make changes for 12 weeks after saving. \n Are you sure you want to save your profile?")){
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
            }
        };


        // Update existing Profile
        $scope.update = function () {
            if(confirm("You will not be able to make changes for 12 weeks after saving. \n Are you sure you want to save your profile?")){
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
            }
        };

        // Find the current user's profile
        $scope.findOne = function (userId) {
            $scope.currentProfile = Profiles.get(
                {user: userId},
                
                // Function for the view/edit profile view
                // Needs to be here so that it only gets called after the get() query finishes
                function(s){

                    // Make the Priority object into an array
                    // Arrays are much easier to display with ng-repeat
                    var p = s.Priority[0];
                    $scope.prioritiesArray = [];
                    angular.forEach(p, function(value, key) {
                        if(key !== '_id'){
                            $scope.prioritiesArray.push({
                                name: key.replace('_', ' ').replace('_', ' '),
                                rank: value
                            });
                        }

                    });

                    // Set the scroller's values to those on the user's profile
                    $scope.profile.satisfactions.personalGrowth = s.Satisfaction[0].Personal_Growth;
                    $scope.profile.satisfactions.career = s.Satisfaction[0].Career;
                    $scope.profile.satisfactions.familyAndFriends = s.Satisfaction[0].Family_and_Friends;
                    $scope.profile.satisfactions.health = s.Satisfaction[0].Health;
                    $scope.profile.satisfactions.physicalEnv = s.Satisfaction[0].Physical_Env;
                    $scope.profile.satisfactions.romance = s.Satisfaction[0].Romance;
                    $scope.profile.satisfactions.money = s.Satisfaction[0].Money;
                    $scope.profile.satisfactions.fun = s.Satisfaction[0].Fun;
                    
                    // Check if it's been 12 weeks since last changed
                    var oneDay = 24*60*60*1000;
                    var dateOnProfile = new Date(s.last_modified);
                    var daysElapsed = Math.round(Math.abs((dateOnProfile.getTime() - (new Date()).getTime())/(oneDay)));

                    // Check if the profile is less than 1 day old (grace period)
                    var createdOn = new Date(s.created_on);
                    var daysSinceCreated = Math.round(Math.abs((createdOn.getTime() - (new Date()).getTime())/(oneDay)));
                    
                    // This variable will be used with ng-show on the view to indicate when it's time to update the profile
                    $scope.profileCanChange = (daysElapsed >= 7*12 || createdOn =< 1);
            });
        };

    }
]);

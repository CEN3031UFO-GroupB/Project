'use strict';

angular.module('users.admin').controller('UserListController', ['$scope', '$filter', 'Admin', 'GoalsService',
  function ($scope, $filter, Admin, GoalsService) {

	$scope.loadData = function(){
      Admin.query(function (data) {
		//Filter by user
		if($scope.checkboxUser) {
          data = data.filter(function(user){
            return user.roles && user.roles[0] !== 'admin';
          });
		}
		
        $scope.users = data;
        $scope.buildPager();
        
        for(var i = 0; i < $scope.users.length; i++) {
          GoalsService.query({ user: $scope.users[i]._id }, function(goals) {
            var goalsStartedPast = 0;
            var goalsCompletedPast = 0;
            var goalsStartedFour = 0;
            var goalsCompletedFour = 0;
            var lastMonday = Date.parse(getLastMonday());
            var fourMonday = Date.parse(getMondayFourWeeksAgo());
  
            if(goals.length > 0) {
              //Goal completion rates
              for(var j = 0; j < goals.length; j++) {
                if(goals[j].week_timestamp) {
                  var timeStamp = Date.parse(goals[j].week_timestamp);
                  //Past 4 weeks
                  if(timeStamp >= (fourMonday - 86400*1000) && timeStamp <= (lastMonday + 86400*1000)) {
                    if(goals[j].completed_at)
                      goalsCompletedFour++;
                    if(goals[j].started_at)
                      goalsStartedFour++;
                  }
                  //Past week
                  if(isWithinADay(timeStamp,lastMonday)) {
                    if(goals[j].completed_at)
                      goalsCompletedPast++;
                    if(goals[j].started_at)
                      goalsStartedPast++;
                  }
                }
              }
              var userIndex = $scope.users.findIndex(x => x._id === goals[0].user._id);

              if(userIndex >= 0 && goalsStartedPast !== 0)
                $scope.users[userIndex].pastWeek = ((goalsCompletedPast / goalsStartedPast)*100).toFixed(1) + '%';
              if(userIndex >= 0 && goalsStartedFour !== 0)
                $scope.users[userIndex].fourWeeks = ((goalsCompletedFour / goalsStartedFour)*100).toFixed(1) + '%';
		    }
          });
	    }
      });
	}

    $scope.buildPager = function () {
      $scope.pagedItems = [];
      $scope.itemsPerPage = 15;
      $scope.currentPage = 1;
      $scope.figureOutItemsToDisplay();
    };

    $scope.figureOutItemsToDisplay = function () {
      $scope.filteredItems = $filter('filter')($scope.users, {
        $: $scope.search
      });
      $scope.filterLength = $scope.filteredItems.length;
      var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
      var end = begin + $scope.itemsPerPage;
      $scope.pagedItems = $scope.filteredItems.slice(begin, end);
    };

    $scope.pageChanged = function () {
      $scope.figureOutItemsToDisplay();
    };
	
    function getLastMonday() {
      var d = new Date();
      var day = d.getDay();
      var diff = d.getDate() - day + (day === 0 ? -6:1);
      var monday = new Date(d.setDate(diff - 7));
      monday.setHours(0, 0, 0, 0);
      return monday;
    }
	
    function getMondayFourWeeksAgo() {
      var d = new Date();
      var day = d.getDay();
      var diff = d.getDate() - day + (day === 0 ? -6:1);
      var monday = new Date(d.setDate(diff - 28));
      monday.setHours(0, 0, 0, 0);
      return monday;
    }
	
    function isWithinADay(base, value) {
      var result = Math.abs(value - base);

      //If epoch time within 24 hours (ms)
      if(result < 86400*1000)
        return true;
      return false;
    }
  }
]);

'use strict';

angular.module('users.admin').controller('UserListController', ['$scope', '$filter', 'Admin', 'GoalsService', 'GoalsPointsService',
  function ($scope, $filter, Admin, GoalsService, GoalsPointsService) {
	//Create array for graph data. Instantiate all values within the array to zero
    $scope.data = [new Array(5+1).join('0').split('').map(parseFloat),new Array(5+1).join('0').split('').map(parseFloat)];
	//Labels for the graph
    $scope.labels = ['4 weeks ago', '3 weeks ago', '2 weeks ago', 'Past week', 'Current week'];
    $scope.series = ['Goals Completed', 'Goals Started'];
    $scope.colors = ['#30bb00', '#347fa5'];
    $scope.options = {
      legend: {
        display: true,
        position: 'right',
      }
    };

	//Function to load all users and statistics data
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

        //Create array filled with zeros
        $scope.data = [new Array(5+1).join('0').split('').map(parseFloat),new Array(5+1).join('0').split('').map(parseFloat)];
        
        for(var i = 0; i < $scope.users.length; i++) {
          GoalsService.Goal.query({ user: $scope.users[i]._id }, function(goals) {
            var goalsStartedPast = 0;
            var goalsCompletedPast = 0;
            var goalsStartedFour = 0;
            var goalsCompletedFour = 0;
            var goalsStartedCurrent = 0;
            var goalsCompletedCurrent = 0;
            var lastMonday = Date.parse(getAnyMonday(1));
            var fourMonday = Date.parse(getAnyMonday(4));
            var currentMonday = Date.parse(getAnyMonday(0));

            if(goals.length > 0) {
              //Goal completion rates
              for(var j = 0; j < goals.length; j++) {
                if(goals[j].week_timestamp) {
                  var timeStamp = Date.parse(goals[j].week_timestamp);
                  //Past 4 weeks (86400*1000 ms is 24 hours in epoch time)
				  //Tolerance is used to account for local time differences
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
                  //Current week
                  if(isWithinADay(timeStamp,currentMonday)) {
                    if(goals[j].completed_at)
                      goalsCompletedCurrent++;
                    if(goals[j].started_at)
                      goalsStartedCurrent++;
                  }
                  //Get data for graph
                  if(goals[j].completed_at || goals[j].started_at) {
                    var index = (4 - getWeekOfMonday(timeStamp));

                    if(index >= 0) {
                      if(goals[j].completed_at)
                        $scope.data[0][index]++;
                      if(goals[j].started_at)
                        $scope.data[1][index]++;
                    }
                  }
                  
                }
              }
			  //Find the user's index within the array
              var userIndex = $scope.users.findIndex(x => x._id === goals[0].user._id);

			  //Add the relevant completion percentage and goals started count to each column
              if(userIndex >= 0 && goalsStartedPast !== 0)
                $scope.users[userIndex].pastWeek = ((goalsCompletedPast / goalsStartedPast)*100).toFixed(1) + '% / ' + goalsStartedPast;
              if(userIndex >= 0 && goalsStartedFour !== 0)
                $scope.users[userIndex].fourWeeks = ((goalsCompletedFour / goalsStartedFour)*100).toFixed(1) + '% / ' + goalsStartedFour;
              if(userIndex >= 0 && goalsStartedCurrent !== 0)
                $scope.users[userIndex].currentWeek = ((goalsCompletedCurrent / goalsStartedCurrent)*100).toFixed(1) + '% / ' + goalsStartedCurrent;
		    }
          });
		  
          //Add rewards points to table
		  GoalsPointsService.get({ user: $scope.users[i]._id }, function(value) {
            var userIndex = $scope.users.findIndex(x => x._id === value.userId);
			
            if(userIndex >= 0)
              $scope.users[userIndex].points = value.points;
          });
	    }
      });
	}

	//Function to build the pagination for the table
    $scope.buildPager = function () {
      $scope.pagedItems = [];
      $scope.itemsPerPage = 15;
      $scope.currentPage = 1;
      $scope.figureOutItemsToDisplay();
    };

	//Function to get the collection of items to display
	//and filter by the search term
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
	
	//Get the date of a Monday depending on the provided offset.
	//Offset being the offset from the current week
	//E.g. 0 is the current week, 1 is the past week,
	//2 is two weeks ago
    function getAnyMonday(offset) {
      var d = new Date();
      var day = d.getDay();
      var diff = d.getDate() - day + (day == 0 ? -6:1);
      var monday = new Date(d.setDate(diff - offset*7));
      monday.setHours(0, 0, 0, 0);
      return monday;
    }
	
	//Get the week of a monday in epoch time
	//E.g. 0 is the current week, 1 is the past week,
	//2 is two weeks ago
    function getWeekOfMonday(monday) {
      var mondayCurrent = Date.parse(getAnyMonday(0));

	  var diff = Math.abs(monday - mondayCurrent);
	  
	  //One week = 604800000 ms
	  var day = diff / 604800000;
	  
	  var dayRounded = Math.round(day);
	  
      return dayRounded;
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

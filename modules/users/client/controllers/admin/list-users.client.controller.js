'use strict';

angular.module('users.admin').controller('UserListController', ['$scope', '$filter', 'Admin', 'GoalsService',
  function ($scope, $filter, Admin, GoalsService) {
    Admin.query(function (data) {
      $scope.users = data;
      $scope.buildPager();
      
	  for(var i = 0; i < $scope.users.length; i++) {
        GoalsService.query({ user: $scope.users[i]._id }, function(value) {
          
        });
	  }
    });

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
  }
]);

'use strict'

angular.module('goals').factory('GoalsLimitService', [
  function () {
    var goalChecks = {
      canAddInProgress: function (goals) {
        var totalInProgress = 0;
        for (var i = 0; i < goals.length; i++) {
          if (goals[i].status === 'In Progress') {
            totalInProgress += 1;
          }
        }
        return totalInProgress < 5;
      }
    };
    return goalChecks;
  }
]);

'use strict';

//Service to calculate the priority of a goal, based on its category
angular.module('goals').factory('PerformanceService', [
  function () {
    return {
      getPerformance: function(allGoals) {

        function getMonday(date) {
          var d = new Date(date);
          var day = d.getDay();
          var diff = d.getDate() - day + (day == 0 ? -6:1);
          var monday = new Date(d.setDate(diff));
          monday.setHours(0, 0, 0, 0);
          return monday;
        }

        var weeks = [];
        var starts = [];
        var finishes = [];
        for (var i = 0; i < allGoals.length; i++) {
          var start = allGoals[i].started_at;
          var end = allGoals[i].completed_at;
          if(start && !weeks.includes(getMonday(start).getTime())){
            weeks.push(getMonday(start).getTime());
          }
          if(end && !weeks.includes(getMonday(end).getTime())){
            weeks.push(getMonday(end).getTime());
          }
        }

        weeks.sort(function(a,b) {return a-b;});

        for (var j = 0; j < weeks.length; j++) {
          var startCount = 0;
          var endCount = 0;
          for (var k = 0; k < allGoals.length; k++) {
            var start2 = allGoals[k].started_at;
            var end2 = allGoals[k].completed_at;
            if (getMonday(start2).getTime() == weeks[j]){
              startCount += 1;
            }
            if (getMonday(end2).getTime() == weeks[j]){
              endCount += 1;
            }
          }
          starts[j] = startCount;
          finishes[j] = endCount;
        }
        return { weeks: weeks, starts: starts, finishes: finishes };
      }
    };
  }
]);

'use strict';

//Service to calculate the priority of a goal, based on its category
angular.module('goals').factory('PriorityService', [
  function () {
    return {
      getPriority: function(profile, category) {
        var cat = category.split(' ').join('_');
        var priority = profile.Priority[0][cat];
        var satisfaction = profile.Satisfaction[0][cat];
        var result = '';
		
        if(priority >= 1 && priority <= 6 && satisfaction >= 1 && satisfaction <= 5) {
          result = 'Support';
        }
        else if(priority >= 1 && priority <= 6 && satisfaction >= 5 && satisfaction <= 10) {
          result = 'Maintenance';
        }
        else if(priority >= 7 && priority <= 11 && satisfaction >= 1 && satisfaction <= 5) {
          result = 'Cut/Shift';
        }
        else if(priority >= 7 && priority <= 11 && satisfaction >= 5 && satisfaction <= 10) {
          result = 'Minimize';
        }
			
        return result;
      }
    };
  }
]);

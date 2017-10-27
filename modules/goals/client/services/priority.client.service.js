'use strict';

//Service to calculate the priority of a goal, based on its category
//TODO: Adjust service based on agreed upon, new, satisfactions and priorities
//TODO: Currently untested. Once profile was adjusted, test and finish this service
angular.module('goals').factory('PriorityService', [
  function () {
	return {
		getPriority: function(profile, category) {
			var priority = profile.Priority[0][category];
			var satisfaction = profile.Satisfaction[0][category];
			
			var result = '';
			
			if(priority >= 1 && priority <= 5 && satisfaction >= 0 && satisfaction <= 4) {
				result = "Support";
			}
			else if(priority >= 1 && priority <= 5 && satisfaction >= 5 && satisfaction <= 10) {
				result = "Maintenance";
			}
			else if(priority >= 6 && priority <= 10 && satisfaction >= 0 && satisfaction <= 4) {
				result = "Cut/Shift";
			}
			else if(priority >= 6 && priority <= 10 && satisfaction >= 5 && satisfaction <= 10) {
				result = "Minimize";
			}
			
			return result;
		}
	}
  }
]);

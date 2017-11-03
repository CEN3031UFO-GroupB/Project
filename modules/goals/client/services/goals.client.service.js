// Goals service used to communicate Goals REST endpoints
(function () {
  'use strict';

  angular
    .module('goals')
    .factory('GoalsService', GoalsService);

  GoalsService.$inject = ['$resource'];

  function GoalsService($resource) {
    var Goal = $resource('api/goals/:goalId', {
      goalId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });

    angular.extend(Goal.prototype, {
      createOrUpdate: function () {
        var goal = this;
        return createOrUpdate(goal);
      }
    });

    return Goal;

    function createOrUpdate(goal) {
      if (goal._id) {
        return goal.$update(onSuccess, onError);
      } else {
        return goal.$save(onSuccess, onError);
      }

      function onSuccess(goal) {
        var success = goal.data;
      }

      function onError(errorResponse) {
        var error = errorResponse.data;
        handleError(error);
      }

      function handleError(error) {
        console.log(error);
      }

    }
  }
}());

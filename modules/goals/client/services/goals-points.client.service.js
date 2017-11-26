// Goals service used to communicate Goals REST endpoints
(function () {
  'use strict';

  angular
    .module('goals')
    .factory('GoalsPointsService', GoalsPointsService);

  GoalsPointsService.$inject = ['$resource'];

  function GoalsPointsService($resource) {
    var Points = $resource('api/goals/points', {
      goalId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
    return Points;
  }
}());

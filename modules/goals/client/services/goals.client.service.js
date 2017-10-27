// Goals service used to communicate Goals REST endpoints
(function () {
  'use strict';

  angular
    .module('goals')
    .factory('GoalsService', GoalsService);

  GoalsService.$inject = ['$resource'];

  function GoalsService($resource) {
    return $resource('api/goals/:goalId', {
      goalId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());

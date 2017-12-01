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


    angular.extend(Points.prototype, {
      createOrUpdate: function () {
        var points = this;
        return createOrUpdate(points);
      }
    });

    return Points;

    function createOrUpdate(points) {
      return points.$update(onSuccess, onError);


      function onSuccess(points) {
        var success = points.data;
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

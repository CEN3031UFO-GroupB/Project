'use strict';

angular.module('profiles').factory('Profile', ['$resource',
  function ($resource) {
    return $resource('api/profiles/:profileId', {
      profileId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
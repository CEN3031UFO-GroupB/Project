'use strict';

angular.module('Profiles').factory('Profile', ['$resource',
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
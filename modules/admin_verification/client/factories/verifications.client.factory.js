'use strict';

angular.module('verifications').factory('Verifications', ['$http', 
  function($http) {
    var methods = {
      read: function(code) {
        return $http.get('/api/verifications/' + code);
      },
      list: function() {
        return $http.get('/api/verifications/');
      },
      create: function(verification) {
        return $http.post('/api/verifications/', verification);
      },
      update: function(code, verification) {
        return $http.put('/api/verifications/' + code, verification);
      }
    };

    return methods;
  }
]);
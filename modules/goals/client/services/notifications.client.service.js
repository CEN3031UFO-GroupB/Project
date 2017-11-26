'use strict';

angular.module('goals').factory('Notifications', ['$http', 
  function($http) {
    var methods = {
      read: function() {
        return $http.get('/api/notifications');
      },
      update: function(notification) {
        return $http.post('/api/notifications', notification);
      }
    };

    return methods;
  }
]);
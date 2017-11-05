'use strict';

angular.module('profiles').config(['$stateProvider',
  function ($stateProvider) {
    // Profiles state routing
    $stateProvider
      .state('profile', {
        abstract: true,
        url: '/profile',
        template: '<ui-view/>'
      })
      .state('profile.view', {
        url: '/view',
        templateUrl: 'modules/profiles/client/views/view-profile.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('profile.create', {
        url: '/create',
        templateUrl: 'modules/profiles/client/views/create-profile.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('profile.edit', {
        url: '/edit',
        templateUrl: 'modules/profiles/client/views/edit-profile.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('admin.profile-view', {
        url: '/profile/:userId',
        templateUrl: 'modules/profiles/client/views/admin/view-profile-admin.client.view.html',
        controller: 'AdminProfile'
      });
  }
]);

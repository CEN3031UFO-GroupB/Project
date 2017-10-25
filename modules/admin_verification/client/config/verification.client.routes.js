'use strict';

angular.module('verifications').config(['$stateProvider',
  function ($stateProvider) {
    // Verifications state routing
    $stateProvider
      .state('verification', {
        abstract: true,
        url: '/verification/manage',
        template: '<ui-view/>'
      })
      .state('verification.manage', {
        url: '/:verificationCode',
        templateUrl: 'modules/admin_verification/client/views/manage-verification.client.view.html'
      });
  }
]);
'use strict';

angular.module('verifications').config(['$stateProvider',
  function ($stateProvider) {
    // Verifications state routing
    $stateProvider
      .state('verification', {
        abstract: true,
        url: '/verification',
        template: '<ui-view/>'
      })
      .state('verification.enter', {
        url: '/:verificationCode',
        templateUrl: 'modules/admin_verification/client/views/enter-verification.client.view.html'
      });
  }
]);
'use strict';

// Configuring the AdminVerifications module
angular.module('verifications').run(['Menus',
  function (Menus) {
    // Add the verification dropdown item
    Menus.addMenuItem('topbar', {
      title: 'Verification Codes',
      state: 'verifications',
      type: 'dropdown',
      roles: ['admin']
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'verifications', {
      title: 'Manage Verification Codes',
      state: 'verification.manage',
      roles: ['admin']
    });
  }
]);
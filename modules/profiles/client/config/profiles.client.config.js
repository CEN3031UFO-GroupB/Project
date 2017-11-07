'use strict';

angular.module('profiles').run(['Menus',
  function (Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Profile',
      state: 'profile.view',
      roles: ['user']
    });
  }
]);

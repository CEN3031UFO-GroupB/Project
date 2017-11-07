'use strict';

angular.module('rewards').run(['Menus',
  function (Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Rewards',
      state: 'rewards.list',
      roles: ['user']
    });
  }
]);

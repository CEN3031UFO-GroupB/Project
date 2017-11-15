'use strict';

angular.module('goals').run(['Menus',
  function (Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Goals',
      state: 'goals.list',
      roles: ['user']
    });
	
    Menus.addMenuItem('topbar', {
      title: 'Notification Settings',
      state: 'notifications.update',
      roles: ['admin']
    });
  }
]);

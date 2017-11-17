'use strict';

angular.module('goals').run(['Menus',
  function (Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Goals',
      state: 'goals',
      roles: ['user', 'admin'],
	  type: 'dropdown'
    });
	
	Menus.addSubMenuItem('topbar', 'goals', {
      title: 'Goals',
      state: 'goals.list',
      roles: ['user']
    });
	
    Menus.addSubMenuItem('topbar', 'goals', {
      title: 'Settings',
      state: 'goals.notifications',
      roles: ['admin']
    });
  }
]);

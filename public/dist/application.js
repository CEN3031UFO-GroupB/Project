'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function () {
  // Init module configuration options
  var applicationModuleName = 'mean';
  var applicationModuleVendorDependencies = ['ngResource', 'ngAnimate', 'ngMessages', 'ui.router', 'ui.bootstrap', 'ui.utils', 'angularFileUpload', 'smart-table'];

  // Add a new vertical module
  var registerModule = function (moduleName, dependencies) {
    // Create angular module
    angular.module(moduleName, dependencies || []);

    // Add the module to the AngularJS configuration file
    angular.module(applicationModuleName).requires.push(moduleName);
  };

  return {
    applicationModuleName: applicationModuleName,
    applicationModuleVendorDependencies: applicationModuleVendorDependencies,
    registerModule: registerModule
  };
})();

'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider', '$httpProvider',
  function ($locationProvider, $httpProvider) {
    $locationProvider.html5Mode(true).hashPrefix('!');

    $httpProvider.interceptors.push('authInterceptor');
  }
]);

angular.module(ApplicationConfiguration.applicationModuleName).run(["$rootScope", "$state", "Authentication", function ($rootScope, $state, Authentication) {

  // Check authentication before changing state
  $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
    if (toState.data && toState.data.roles && toState.data.roles.length > 0) {
      var allowed = false;
      toState.data.roles.forEach(function (role) {
        if (Authentication.user.roles !== undefined && Authentication.user.roles.indexOf(role) !== -1) {
          allowed = true;
          return true;
        }
      });

      if (!allowed) {
        event.preventDefault();
        if (Authentication.user !== undefined && typeof Authentication.user === 'object') {
          $state.go('forbidden');
        } else {
          $state.go('authentication.signin').then(function () {
            storePreviousState(toState, toParams);
          });
        }
      }
    }
  });

  // Record previous state
  $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
    storePreviousState(fromState, fromParams);
  });

  // Store previous state
  function storePreviousState(state, params) {
    // only store this state if it shouldn't be ignored 
    if (!state.data || !state.data.ignoreState) {
      $state.previous = {
        state: state,
        params: params,
        href: $state.href(state, params)
      };
    }
  }
}]);

//Then define the init function for starting up the application
angular.element(document).ready(function () {
  //Fixing facebook bug with redirect
  if (window.location.hash && window.location.hash === '#_=_') {
    if (window.history && history.pushState) {
      window.history.pushState('', document.title, window.location.pathname);
    } else {
      // Prevent scrolling by storing the page's current scroll offset
      var scroll = {
        top: document.body.scrollTop,
        left: document.body.scrollLeft
      };
      window.location.hash = '';
      // Restore the scroll offset, should be flicker free
      document.body.scrollTop = scroll.top;
      document.body.scrollLeft = scroll.left;
    }
  }

  //Then init the app
  angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('verifications', ['smart-table']);
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('chat');

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');
ApplicationConfiguration.registerModule('core.admin', ['core']);
ApplicationConfiguration.registerModule('core.admin.routes', ['ui.router']);

(function (app) {
  'use strict';

  app.registerModule('goals', ['chart.js']);
}(ApplicationConfiguration));

'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('profiles', ['ui.sortable', 'ui.slider']);
(function (app) {
  'use strict';
  app.registerModule('rewards');


}(ApplicationConfiguration));
'use strict';

// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users', ['core']);
ApplicationConfiguration.registerModule('users.admin', ['core.admin']);
ApplicationConfiguration.registerModule('users.admin.routes', ['core.admin.routes']);

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
'use strict';

angular.module('verifications').controller('VerificationsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Verifications', 'Admin',
    function ($scope, $stateParams, $location, Authentication, Verifications, Admin) {
      $scope.authentication = Authentication;
      $scope.code = '';
      $scope.codeCreate = '';
	  
      $scope.buildPager = function () {
        $scope.itemsPerPage = 15;
        $scope.currentPage = 1;
		$scope.ListVerifications();
      };
	  
      Admin.query(function (data) {
        $scope.users = data;
        $scope.buildPager();
      });
	  
	  $scope.figureOutItemsToDisplay = function () {
		  $scope.itemLength = $scope.veriList.length;
        var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
        var end = begin + $scope.itemsPerPage;
        $scope.pagedItems = $scope.veriList.slice(begin, end);
    };

    $scope.pageChanged = function () {
      $scope.figureOutItemsToDisplay();
    };

      $scope.CheckVerification = function () {
        var code = $scope.code;

        Verifications.read(code)
          .then(function (response) {
            $scope.errorMsg = '';
            $scope.verification = response.data;
		    
            //Update the verification code to inactive in the db, and add the userId
            Verifications.update(response.data.code, {
              'verification': {
                'code': response.data.code,
                'user_id': $scope.authentication.user._id,
                'active': false
              }
            })
			.then(function (response) {
              //Success
			}, function (error) {
              //Error
			});
          }, function (error) {
            $scope.errorMsg = 'Invalid code "' + code;
          });
      };
		
      $scope.CreateUserVerification = function () {
        $scope.codeCreate = Math.random().toString(36).substring(6);
		
        Verifications.create({ 'code': $scope.codeCreate, 'user_id': '-1', 'active': true, 'created_at': new Date(), 'type': 'user'
		})
		.then(function (response) { 
		$scope.codeCreate = '';
		$scope.ListVerifications();
		}, function (error) {
			
		});
      };
	  
	  $scope.CreateAdminVerification = function () {
        $scope.codeCreate = Math.random().toString(36).substring(6);
		
        Verifications.create({ 'code': $scope.codeCreate, 'user_id': '-1', 'active': true, 'created_at': new Date(), 'type': 'admin'
		})
		.then(function (response) { 
		$scope.codeCreate = '';
		$scope.ListVerifications();
		}, function (error) {
			
		});
      };
	  
      $scope.ListVerifications = function () {
        Verifications.list().then(function (response) { 
		$scope.veriList = response.data;
		for(var i = 0; i < $scope.veriList.length; i++){
			if($scope.veriList[i].user_id !== '-1' && $scope.veriList[i].user_id !== ''){
				var index = $scope.users.findIndex(x => x._id === $scope.veriList[i].user_id);

				$scope.veriList[i].user_id = $scope.users[index].displayName;
			}
			else
                $scope.veriList[i].user_id = '';
		}
        $scope.figureOutItemsToDisplay();
        }, function (error) {
        });
      };
    }
]);

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
'use strict';

// Configuring the Chat module
angular.module('chat').run(['Menus',
  function (Menus) {
    // Set top bar menu items
    //Menus.addMenuItem('topbar', {
    //  title: 'Chat',
    //  state: 'chat'
    //});
  }
]);

'use strict';

// Configure the 'chat' module routes
angular.module('chat').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('chat', {
        url: '/chat',
        templateUrl: 'modules/chat/client/views/chat.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      });
  }
]);

'use strict';

// Create the 'chat' controller
angular.module('chat').controller('ChatController', ['$scope', '$location', 'Authentication', 'Socket',
  function ($scope, $location, Authentication, Socket) {
    // Create a messages array
    $scope.messages = [];

    // If user is not signed in then redirect back home
    if (!Authentication.user) {
      $location.path('/');
    }

    // Make sure the Socket is connected
    if (!Socket.socket) {
      Socket.connect();
    }

    // Add an event listener to the 'chatMessage' event
    Socket.on('chatMessage', function (message) {
      $scope.messages.unshift(message);
    });

    // Create a controller method for sending messages
    $scope.sendMessage = function () {
      // Create a new message object
      var message = {
        text: this.messageText
      };

      // Emit a 'chatMessage' message event
      Socket.emit('chatMessage', message);

      // Clear the message text
      this.messageText = '';
    };

    // Remove the event listener when the controller instance is destroyed
    $scope.$on('$destroy', function () {
      Socket.removeListener('chatMessage');
    });
  }
]);

'use strict';

angular.module('core.admin').run(['Menus',
  function (Menus) {
    Menus.addMenuItem('topbar', {
      title: 'Admin',
      state: 'admin',
      type: 'dropdown',
      roles: ['admin']
    });
  }
]);

'use strict';

// Setting up route
angular.module('core.admin.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin', {
        abstract: true,
        url: '/admin',
        template: '<ui-view/>',
        data: {
          roles: ['admin']
        }
      });
  }
]);

'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {

    // Redirect to 404 when route not found
    $urlRouterProvider.otherwise(function ($injector, $location) {
      $injector.get('$state').transitionTo('not-found', null, {
        location: false
      });
    });

    // Home state routing
    $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'modules/core/client/views/home.client.view.html'
    })
    .state('not-found', {
      url: '/not-found',
      templateUrl: 'modules/core/client/views/404.client.view.html',
      data: {
        ignoreState: true
      }
    })
    .state('bad-request', {
      url: '/bad-request',
      templateUrl: 'modules/core/client/views/400.client.view.html',
      data: {
        ignoreState: true
      }
    })
    .state('forbidden', {
      url: '/forbidden',
      templateUrl: 'modules/core/client/views/403.client.view.html',
      data: {
        ignoreState: true
      }
    });
  }
]);

'use strict';

angular.module('core').controller('HeaderController', ['$scope', '$state', 'Authentication', 'Menus',
  function ($scope, $state, Authentication, Menus) {
    // Expose view variables
    $scope.$state = $state;
    $scope.authentication = Authentication;

    // Get the topbar menu
    $scope.menu = Menus.getMenu('topbar');

    // Toggle the menu items
    $scope.isCollapsed = false;
    $scope.toggleCollapsibleMenu = function () {
      $scope.isCollapsed = !$scope.isCollapsed;
    };

    // Collapsing the menu after navigation
    $scope.$on('$stateChangeSuccess', function () {
      $scope.isCollapsed = false;
    });
  }
]);

'use strict';

angular.module('core').controller('HomeController', ['$scope', '$state', 'Authentication', 'Profiles',
  function ($scope, $state, Authentication, Profiles) {
    // This provides Authentication context.
    $scope.authentication = Authentication;
	
	//Redirect to login if user is not logged in
    (function () {
      if(!$scope.authentication.user)
        $state.go('authentication.signin', $state.previous.params);
    })();
  
	//Redirect to profile creation if user has not created a profile
    (function () {
      var profile = Profiles.get({
        user: $scope.authentication.user._id
      }, function(profile, response){
        if(!profile._id)
          $state.go('profile.create', $state.previous.params);
      });
    })();
  }]);
'use strict';

/**
 * Edits by Ryan Hutchison
 * Credit: https://github.com/paulyoder/angular-bootstrap-show-errors */

angular.module('core')
  .directive('showErrors', ['$timeout', '$interpolate', function ($timeout, $interpolate) {
    var linkFn = function (scope, el, attrs, formCtrl) {
      var inputEl, inputName, inputNgEl, options, showSuccess, toggleClasses,
        initCheck = false,
        showValidationMessages = false,
        blurred = false;

      options = scope.$eval(attrs.showErrors) || {};
      showSuccess = options.showSuccess || false;
      inputEl = el[0].querySelector('.form-control[name]') || el[0].querySelector('[name]');
      inputNgEl = angular.element(inputEl);
      inputName = $interpolate(inputNgEl.attr('name') || '')(scope);

      if (!inputName) {
        throw 'show-errors element has no child input elements with a \'name\' attribute class';
      }

      var reset = function () {
        return $timeout(function () {
          el.removeClass('has-error');
          el.removeClass('has-success');
          showValidationMessages = false;
        }, 0, false);
      };

      scope.$watch(function () {
        return formCtrl[inputName] && formCtrl[inputName].$invalid;
      }, function (invalid) {
        return toggleClasses(invalid);
      });

      scope.$on('show-errors-check-validity', function (event, name) {
        if (angular.isUndefined(name) || formCtrl.$name === name) {
          initCheck = true;
          showValidationMessages = true;

          return toggleClasses(formCtrl[inputName].$invalid);
        }
      });

      scope.$on('show-errors-reset', function (event, name) {
        if (angular.isUndefined(name) || formCtrl.$name === name) {
          return reset();
        }
      });

      toggleClasses = function (invalid) {
        el.toggleClass('has-error', showValidationMessages && invalid);
        if (showSuccess) {
          return el.toggleClass('has-success', showValidationMessages && !invalid);
        }
      };
    };

    return {
      restrict: 'A',
      require: '^form',
      compile: function (elem, attrs) {
        if (attrs.showErrors.indexOf('skipFormGroupCheck') === -1) {
          if (!(elem.hasClass('form-group') || elem.hasClass('input-group'))) {
            throw 'show-errors element does not have the \'form-group\' or \'input-group\' class';
          }
        }
        return linkFn;
      }
    };
  }]);

'use strict';

angular.module('core').factory('authInterceptor', ['$q', '$injector',
  function ($q, $injector) {
    return {
      responseError: function(rejection) {
        if (!rejection.config.ignoreAuthModule) {
          switch (rejection.status) {
            case 401:
              $injector.get('$state').transitionTo('authentication.signin');
              break;
            case 403:
              $injector.get('$state').transitionTo('forbidden');
              break;
          }
        }
        // otherwise, default behaviour
        return $q.reject(rejection);
      }
    };
  }
]);

'use strict';

//Menu service used for managing  menus
angular.module('core').service('Menus', [
  function () {
    // Define a set of default roles
    this.defaultRoles = ['user', 'admin'];

    // Define the menus object
    this.menus = {};

    // A private function for rendering decision
    var shouldRender = function (user) {
      if (!!~this.roles.indexOf('*')) {
        return true;
      } else {
        if(!user) {
          return false;
        }
        for (var userRoleIndex in user.roles) {
          for (var roleIndex in this.roles) {
            if (this.roles[roleIndex] === user.roles[userRoleIndex]) {
              return true;
            }
          }
        }
      }

      return false;
    };

    // Validate menu existance
    this.validateMenuExistance = function (menuId) {
      if (menuId && menuId.length) {
        if (this.menus[menuId]) {
          return true;
        } else {
          throw new Error('Menu does not exist');
        }
      } else {
        throw new Error('MenuId was not provided');
      }

      return false;
    };

    // Get the menu object by menu id
    this.getMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Return the menu object
      return this.menus[menuId];
    };

    // Add new menu object by menu id
    this.addMenu = function (menuId, options) {
      options = options || {};

      // Create the new menu
      this.menus[menuId] = {
        roles: options.roles || this.defaultRoles,
        items: options.items || [],
        shouldRender: shouldRender
      };

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Return the menu object
      delete this.menus[menuId];
    };

    // Add menu item object
    this.addMenuItem = function (menuId, options) {
      options = options || {};

      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Push new menu item
      this.menus[menuId].items.push({
        title: options.title || '',
        state: options.state || '',
        type: options.type || 'item',
        class: options.class,
        roles: ((options.roles === null || typeof options.roles === 'undefined') ? this.defaultRoles : options.roles),
        position: options.position || 0,
        items: [],
        shouldRender: shouldRender
      });

      // Add submenu items
      if (options.items) {
        for (var i in options.items) {
          this.addSubMenuItem(menuId, options.state, options.items[i]);
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Add submenu item object
    this.addSubMenuItem = function (menuId, parentItemState, options) {
      options = options || {};

      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].state === parentItemState) {
          // Push new submenu item
          this.menus[menuId].items[itemIndex].items.push({
            title: options.title || '',
            state: options.state || '',
            roles: ((options.roles === null || typeof options.roles === 'undefined') ? this.menus[menuId].items[itemIndex].roles : options.roles),
            position: options.position || 0,
            shouldRender: shouldRender
          });
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeMenuItem = function (menuId, menuItemState) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].state === menuItemState) {
          this.menus[menuId].items.splice(itemIndex, 1);
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    // Remove existing menu object by menu id
    this.removeSubMenuItem = function (menuId, submenuItemState) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);

      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
          if (this.menus[menuId].items[itemIndex].items[subitemIndex].state === submenuItemState) {
            this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
          }
        }
      }

      // Return the menu object
      return this.menus[menuId];
    };

    //Adding the topbar menu
    this.addMenu('topbar', {
      roles: ['*']
    });
  }
]);

'use strict';

// Create the Socket.io wrapper service
angular.module('core').service('Socket', ['Authentication', '$state', '$timeout',
  function (Authentication, $state, $timeout) {
    // Connect to Socket.io server
    this.connect = function () {
      // Connect only when authenticated
      if (Authentication.user) {
        this.socket = io();
      }
    };
    this.connect();

    // Wrap the Socket.io 'on' method
    this.on = function (eventName, callback) {
      if (this.socket) {
        this.socket.on(eventName, function (data) {
          $timeout(function () {
            callback(data);
          });
        });
      }
    };

    // Wrap the Socket.io 'emit' method
    this.emit = function (eventName, data) {
      if (this.socket) {
        this.socket.emit(eventName, data);
      }
    };

    // Wrap the Socket.io 'removeListener' method
    this.removeListener = function (eventName) {
      if (this.socket) {
        this.socket.removeListener(eventName);
      }
    };
  }
]);

'use strict';

angular.module('goals').run(['Menus',
  function (Menus) {
    // Set top bar menu items
    Menus.addMenuItem('topbar', {
      title: 'Goals',
      state: 'goals.list',
      roles: ['user']
    });
  }
]);

(function () {
  'use strict';

  angular
    .module('goals')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('goals', {
        abstract: true,
        url: '/goals',
        template: '<ui-view/>'
      })
      .state('goals.list', {
        url: '',
        templateUrl: 'modules/goals/client/views/list-goals.client.view.html',
        controller: 'GoalsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Goals List'
        }
      })
      .state('goals.create', {
        url: '/create',
        templateUrl: 'modules/goals/client/views/form-goal.client.view.html',
        controller: 'GoalsController',
        controllerAs: 'vm',
        resolve: {
          goalResolve: newGoal
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Goals Create'
        }
      })
      .state('goals.edit', {
        url: '/:goalId/edit',
        templateUrl: 'modules/goals/client/views/form-goal.client.view.html',
        controller: 'GoalsController',
        controllerAs: 'vm',
        resolve: {
          goalResolve: getGoal
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Goal {{ goalResolve.title }}'
        }
      })
      .state('goals.view', {
        url: '/:goalId',
        templateUrl: 'modules/goals/client/views/view-goal.client.view.html',
        controller: 'GoalsController',
        controllerAs: 'vm',
        resolve: {
          goalResolve: getGoal
        },
        data: {
          pageTitle: 'Goal {{ goalResolve.title }}'
        }
      })
      .state('admin.goals-view', {
        url: '/:goalId',
        templateUrl: 'modules/goals/client/views/admin/view-goals-admin.client.view.html',
        controller: 'GoalsListController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Goals List'
        }
      });
  }

  getGoal.$inject = ['$stateParams', 'GoalsService'];

  function getGoal($stateParams, GoalsService) {
    return GoalsService.get({
      goalId: $stateParams.goalId
    }).$promise;
  }

  newGoal.$inject = ['GoalsService'];

  function newGoal(GoalsService) {
    return new GoalsService();
  }
}());

(function () {
  'use strict';

  // Goals controller
  angular
    .module('goals')
    .controller('GoalsController', GoalsController);

  GoalsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'goalResolve'];

  function GoalsController ($scope, $state, $window, Authentication, goal) {
    var vm = this;

    vm.authentication = Authentication;
    vm.goal = goal;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;

    //Hard-coded categories. TODO: move them from the profiles controller into an injectable service
    $scope.categories = ['Family', 'Health', 'Rest and Relaxation', 'Faith', 'Finance', 'Romance', 'Friends',
                          'Contribution', 'Personal Growth', 'Career', 'Physical Environment'];

    // Remove existing Goal
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.goal.$remove($state.go('goals.list'));
      }
    }

    $scope.cancel = function() {
      $state.go('goals.list');
    };

    // Save Goal
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.goalForm');
        return false;
      }

      //Create or update a goal using the GoalsService
      vm.goal.createOrUpdate()
        .then(successCallback)
        .catch(errorCallback);


      function successCallback(res) {
        $state.go('goals.list', {
          goalId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());

(function () {
  'use strict';

  angular
    .module('goals')
    .controller('GoalsListController', GoalsListController);

  GoalsListController.$inject = ['$scope', '$state', '$window', 'Authentication', 'GoalsService', 'PriorityService', 'Profiles'];

  function GoalsListController($scope, $state, $window, Authentication, GoalsService, PriorityService, Profiles) {
    var vm = this;

	//Add priorities to goals
    (function() {
      GoalsService.query().$promise.then(function(value) {
        vm.goals = value;
        var userId = '';

        if(vm.goals.length > 0)
        {				
          userId = vm.goals[0].user._id;

          Profiles.get({ user: userId }, function(value) {
            $scope.userProfile = value;

            for(var i = 0; i < vm.goals.length; i++) {
              var priority = PriorityService.getPriority($scope.userProfile, vm.goals[i].category);
              vm.goals[i].priority = priority;
            }
          });
        }
      });
    })();

    function getThisMonday() {
      var d = new Date();
      var day = d.getDay();
      var diff = d.getDate() - day + (day == 0 ? -6:1);
      var monday = new Date(d.setDate(diff));
      monday.setHours(0, 0, 0, 0);
      return monday;
    }
    $scope.monday = getThisMonday();
    var today = new Date();
    var timeDiff = Math.abs(today.getTime() - $scope.monday.getTime());
    $scope.diffDays = 7 - Math.ceil(timeDiff / (1000 * 3600 * 24));


    $scope.status = ['Complete', 'In Progress', 'Not Started'];

    $scope.createGoal = function () {
      $state.go('goals.create');
    };

    $scope.markGoalInProgress = function (goal) {
      goal.status = 'In Progress';
      goal.started_at = new Date();
      console.log(JSON.stringify(goal));
      GoalsService.update(goal);
    };

    $scope.markGoalComplete = function (goal) {
      goal.status = 'Complete';
      goal.completed_at = new Date();
      console.log(JSON.stringify(goal));
      GoalsService.update(goal);
    };

  }
}());

// Goals service used to communicate Goals REST endpoints
(function () {
  'use strict';

  angular
    .module('goals')
    .factory('GoalsService', GoalsService);

  GoalsService.$inject = ['$resource'];

  function GoalsService($resource) {
    var Goal = $resource('api/goals/:goalId', {
      goalId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });

    angular.extend(Goal.prototype, {
      createOrUpdate: function () {
        var goal = this;
        return createOrUpdate(goal);
      }
    });

    return Goal;

    function createOrUpdate(goal) {
      if (goal._id) {
        return goal.$update(onSuccess, onError);
      } else {
        return goal.$save(onSuccess, onError);
      }

      function onSuccess(goal) {
        var success = goal.data;
      }

      function onError(errorResponse) {
        var error = errorResponse.data;
        handleError(error);
      }

      function handleError(error) {
        console.log(error);
      }

    }
  }
}());

'use strict';

//Service to calculate the priority of a goal, based on its category
angular.module('goals').factory('PriorityService', [
  function () {
    return {
      getPriority: function(profile, category) {
        var cat = category.split(' ').join('_');
        var priority = profile.Priority[0][cat];
        var satisfaction = profile.Satisfaction[0][cat];
        var result = '';
		
        if(priority >= 1 && priority <= 6 && satisfaction >= 1 && satisfaction <= 5) {
          result = 'Support';
        }
        else if(priority >= 1 && priority <= 6 && satisfaction >= 5 && satisfaction <= 10) {
          result = 'Maintenance';
        }
        else if(priority >= 7 && priority <= 11 && satisfaction >= 1 && satisfaction <= 5) {
          result = 'Cut/Shift';
        }
        else if(priority >= 7 && priority <= 11 && satisfaction >= 5 && satisfaction <= 10) {
          result = 'Minimize';
        }
			
        return result;
      }
    };
  }
]);

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

'use strict';

angular.module('profiles').controller('AdminProfile', ['$scope', '$stateParams', 'Authentication', 'Profiles',
  function ($scope, $stateParams, Authentication, Profiles) {
    $scope.authentication = Authentication;
	
    $scope.currentProfile = Profiles.get(
      { user: $stateParams.userId },
      function(prof) {
        $scope.prioritiesArray = [];
        angular.forEach(prof.Priority[0], function(value,key) {
          if(key !== '_id'){
            $scope.prioritiesArray.push({
              name: key.replace('_', ' ').replace('_', ' '),
              rank: value
            });
          }
        });
        $scope.Satisfaction = prof.Satisfaction[0];
        $scope.user = prof.user.displayName;
      }
    );
  }
]);

'use strict';

angular.module('profiles').controller('ProfilesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Profiles', 'orderByFilter',
    function ($scope, $stateParams, $location, Authentication, Profiles, orderByFilter) {
        $scope.authentication = Authentication;
        $scope.profile = {
            priorities: [
                {
                    name: 'Family'
                },
                {
                    name: 'Health'
                },
                {
                    name: 'Rest and Relaxation'
                },
                {
                    name: 'Faith'
                },
                {
                    name: 'Finance'
                },
                {
                    name: 'Romance'
                },
                {
                    name: 'Friends'
                },
                {
                    name: 'Contribution'
                },
                {
                    name: 'Personal Growth'
                },
                {
                    name: 'Career'
                },
                {
                    name: 'Physical Environment'
                },
            ],
			satisfactions: {
                Family: 5,
                Health: 5,
                Rest_and_Relaxation: 5,
                Faith: 5,
                Finance: 5,
                Romance: 5,
                Friends: 5,
                Contribution: 5,
                Personal_Growth: 5,
                Career: 5,
                Physical_Environment: 5
			}
        };

        // Create new Profile
        $scope.CreateProfile = function () {
            if(confirm("You will not be able to make changes for 12 weeks after saving. \n Are you sure you want to save your profile?")){
                $scope.error = null;

                // Create new Profile object
                var profile = new Profiles({
                    Priority: {
                        Family: $scope.profile.priorities.findIndex(x => x.name === "Family") + 1,
                        Health: $scope.profile.priorities.findIndex(x => x.name === "Health") + 1,
                        Rest_and_Relaxation: $scope.profile.priorities.findIndex(x => x.name === "Rest and Relaxation") + 1,
                        Faith: $scope.profile.priorities.findIndex(x => x.name === "Faith") + 1,
                        Finance: $scope.profile.priorities.findIndex(x => x.name === "Finance") + 1,
                        Romance: $scope.profile.priorities.findIndex(x => x.name === "Romance") + 1,
                        Friends: $scope.profile.priorities.findIndex(x => x.name === "Friends") + 1,
                        Contribution: $scope.profile.priorities.findIndex(x => x.name === "Contribution") + 1,
                        Personal_Growth: $scope.profile.priorities.findIndex(x => x.name === "Personal Growth") + 1,
                        Career: $scope.profile.priorities.findIndex(x => x.name === "Career") + 1,
                        Physical_Environment: $scope.profile.priorities.findIndex(x => x.name === "Physical Environment") + 1,
                    },
                    Satisfaction: $scope.profile.satisfactions
                });
    						
                // Redirect after save
                profile.$save(function (response) {
                    $location.path('profile/view');

                }, function (errorResponse) {
                    $scope.error = errorResponse.data.message;
                });
            }
        };


        // Update existing Profile
        $scope.update = function () {
            if(confirm("You will not be able to make changes for 12 weeks after saving. \n Are you sure you want to save your profile?")){
                $scope.error = null;
                $scope.currentProfile = Profiles.get(
                {user: $scope.authentication.user._id},

                function(result){
                var profile = $scope.currentProfile;
                    profile.Priority = {
                        Family: $scope.profile.priorities.findIndex(x => x.name === "Family") + 1,
                        Health: $scope.profile.priorities.findIndex(x => x.name === "Health") + 1,
                        Rest_and_Relaxation: $scope.profile.priorities.findIndex(x => x.name === "Rest and Relaxation") + 1,
                        Faith: $scope.profile.priorities.findIndex(x => x.name === "Faith") + 1,
                        Finance: $scope.profile.priorities.findIndex(x => x.name === "Finance") + 1,
                        Romance: $scope.profile.priorities.findIndex(x => x.name === "Romance") + 1,
                        Friends: $scope.profile.priorities.findIndex(x => x.name === "Friends") + 1,
                        Contribution: $scope.profile.priorities.findIndex(x => x.name === "Contribution") + 1,
                        Personal_Growth: $scope.profile.priorities.findIndex(x => x.name === "Personal Growth") + 1,
                        Career: $scope.profile.priorities.findIndex(x => x.name === "Career") + 1,
                        Physical_Environment: $scope.profile.priorities.findIndex(x => x.name === "Physical Environment") + 1,
                    };
                    profile.Satisfaction = $scope.profile.satisfactions;

                    profile.$update(function () {
                        $location.path('profile/view');
                    }, function (errorResponse) {
                        $scope.error = errorResponse.data.message;
                    });
                });
            }
        };

        // Find the current user's profile
        $scope.findOne = function (userId) {
            $scope.currentProfile = Profiles.get(
                {user: userId},
                
                // Function for the view/edit profile view
                // Needs to be here so that it only gets called after the get() query finishes
                function(result){

                    // Make the Priority object into an array
                    // Arrays are much easier to display with ng-repeat
                    var p = result.Priority[0];
                    $scope.prioritiesArray = [];
                    angular.forEach(p, function(value, key) {
                        if(key !== '_id'){
                            $scope.prioritiesArray.push({
                                name: key.replace('_', ' ').replace('_', ' '),
                                rank: value
                            });
                        }
                    });
                    $scope.profile.priorities = orderByFilter($scope.prioritiesArray, 'rank');

                    // Set the scroller's values to those on the user's profile
                    $scope.profile.satisfactions = result.Satisfaction[0];
                    
                    // Check if it's been 12 weeks since last changed
                    var oneDay = 24*60*60*1000;
                    var dateOnProfile = new Date(result.last_modified);
                    var daysElapsed = Math.round(Math.abs((dateOnProfile.getTime() - (new Date()).getTime())/(oneDay)));

                    // Check if the profile is less than 1 day old (grace period)
                    var createdOn = new Date(result.created_on);
                    var daysSinceCreated = Math.round(Math.abs((createdOn.getTime() - (new Date()).getTime())/(oneDay)));
                    
                    // This variable will be used with ng-show on the view to indicate when it's time to update the profile
                    $scope.profileCanChange = (daysElapsed >= 7*12 || daysSinceCreated <= 1);
            });
        };

    }
]);

'use strict';

angular.module('profiles').factory('Profiles', ['$resource',
  function ($resource) {
    return $resource('api/profiles/:profileId', {
      profileId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
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

(function () {
  'use strict';

  angular
    .module('rewards')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('rewards', {
        abstract: true,
        url: '/rewards',
        template: '<ui-view/>'
      })
      .state('rewards.list', {
        url: '',
        templateUrl: 'modules/rewards/client/views/list-rewards.client.view.html',
        controller: 'RewardsListController',
        controllerAs: 'vm',
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Rewards List'
        }
      })
      .state('rewards.create', {
        url: '/create',
        templateUrl: 'modules/rewards/client/views/form-reward.client.view.html',
        controller: 'RewardsController',
        controllerAs: 'vm',
        resolve: {
          rewardResolve: newReward
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Rewards Create'
        }
      })
      .state('rewards.edit', {
        url: '/:rewardId/edit',
        templateUrl: 'modules/rewards/client/views/form-reward.client.view.html',
        controller: 'RewardsController',
        controllerAs: 'vm',
        resolve: {
          rewardResolve: getReward
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Edit Reward {{ rewardResolve.name }}'
        }
      })
      .state('rewards.view', {
        url: '/:rewardId',
        templateUrl: 'modules/rewards/client/views/view-reward.client.view.html',
        controller: 'RewardsController',
        controllerAs: 'vm',
        resolve: {
          rewardResolve: getReward
        },
        data: {
          roles: ['user', 'admin'],
          pageTitle: 'Reward {{ rewardResolve.name }}'
        }
      });
  }

  getReward.$inject = ['$stateParams', 'RewardsService'];

  function getReward($stateParams, RewardsService) {
    return RewardsService.get({
      rewardId: $stateParams.rewardId
    }).$promise;
  }

  newReward.$inject = ['RewardsService'];

  function newReward(RewardsService) {
    return new RewardsService();
  }
}());

(function () {
  'use strict';

  angular
    .module('rewards')
    .controller('RewardsListController', RewardsListController);

  RewardsListController.$inject = ['RewardsService', 'PagerService', 'Authentication', 'filterFilter'];

  function RewardsListController(RewardsService, PagerService, Authentication, filterFilter) {
    var vm = this;
    vm.authentication = Authentication;

    vm.rewards = RewardsService.query(function(){
      vm.setPageClaimed(1);
    });
    vm.claimedPager = {};
    vm.setPageClaimed = setPageClaimed;

    function setPageClaimed(page) {
      if (page < 1 || page > vm.claimedPager.totalPages) {
          return;
      }
      var pageSize = 5;
      vm.claimedRewards = filterFilter(vm.rewards, {claimed: true});
      // get pager object from service
      vm.claimedPager = PagerService.GetPager(vm.claimedRewards.length, page, pageSize);

      // get current page of items
      vm.claimedItems = vm.claimedRewards.slice(vm.claimedPager.startIndex, vm.claimedPager.endIndex + 1);
    }

  }
}());

(function () {
  'use strict';

  // Rewards controller
  angular
    .module('rewards')
    .controller('RewardsController', RewardsController);

  RewardsController.$inject = ['$scope', '$state', '$window', 'Authentication', 'rewardResolve'];

  function RewardsController ($scope, $state, $window, Authentication, reward) {
    var vm = this;

    vm.authentication = Authentication;
    vm.reward = reward;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.save = save;
    vm.claim = claim;

    // Remove existing Reward
    function remove() {
      if ($window.confirm('Are you sure you want to delete?')) {
        vm.reward.$remove($state.go('rewards.list'));
      }
    }

    function claim() {
      vm.reward.claimed = true;
      vm.reward.claimed_on = Date.now();
      vm.reward.$update(successCallback, errorCallback);

      function successCallback(res) {
        $state.go('rewards.list', {
          rewardId: res._id
        });
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }

    }

    // Save Reward
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.rewardForm');
        return false;
      }

      // TODO: move create/update logic to service
      if (vm.reward._id) {
        vm.reward.$update(successCallback, errorCallback);
      } else {
        vm.reward.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        $state.go('rewards.list');
      }

      function errorCallback(res) {
        vm.error = res.data.message;
      }
    }
  }
}());

// Rewards service used to communicate Rewards REST endpoints

(function () {
  'use strict';

  angular
    .module('rewards')
    .factory('RewardsService', RewardsService);
  angular
    .module('rewards')
    .service('PagerService', PagerService);

  RewardsService.$inject = ['$resource'];

  function RewardsService($resource) {
    return $resource('api/rewards/:rewardId', {
      rewardId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }

  function PagerService() {
    // service definition
    var service = {};
 
    service.GetPager = GetPager;
 
    return service;
 
    // service implementation
    function GetPager(totalItems, currentPage, pageSize) {
      // default to first page
      currentPage = currentPage || 1;

      // default page size is 10
      //pageSize = pageSize || 10;

      // calculate total pages
      var totalPages = Math.ceil(totalItems / pageSize);

      var startPage, endPage;
      if (totalPages <= 10) {
          // less than 10 total pages so show all
          startPage = 1;
          endPage = totalPages;
      } else {
          // more than 10 total pages so calculate start and end pages
          if (currentPage <= 6) {
              startPage = 1;
              endPage = 10;
          } else if (currentPage + 4 >= totalPages) {
              startPage = totalPages - 9;
              endPage = totalPages;
          } else {
              startPage = currentPage - 5;
              endPage = currentPage + 4;
          }
      }

      // calculate start and end item indexes
      var startIndex = (currentPage - 1) * pageSize;
      var endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

      // create an array of pages to ng-repeat in the pager control
      //var pages = angular.range(startPage, endPage + 1);
      var pages = [];
      var i = startPage;
      while(i <= endPage){
        pages.push(i);
        i++;
      }

      // return object with all pager properties required by the view
      return {
          totalItems: totalItems,
          currentPage: currentPage,
          pageSize: pageSize,
          totalPages: totalPages,
          startPage: startPage,
          endPage: endPage,
          startIndex: startIndex,
          endIndex: endIndex,
          pages: pages
      };
    }
  }


}());

'use strict';

// Configuring the Articles module
angular.module('users.admin').run(['Menus',
  function (Menus) {
    Menus.addSubMenuItem('topbar', 'admin', {
      title: 'Manage Users',
      state: 'admin.users'
    });
  }
]);

'use strict';

// Setting up route
angular.module('users.admin.routes').config(['$stateProvider',
  function ($stateProvider) {
    $stateProvider
      .state('admin.users', {
        url: '/users',
        templateUrl: 'modules/users/client/views/admin/list-users.client.view.html',
        controller: 'UserListController'
      })
      .state('admin.user', {
        url: '/users/:userId',
        templateUrl: 'modules/users/client/views/admin/view-user.client.view.html',
        controller: 'UserController',
        resolve: {
          userResolve: ['$stateParams', 'Admin', function ($stateParams, Admin) {
            return Admin.get({
              userId: $stateParams.userId
            });
          }]
        }
      })
      .state('admin.user-edit', {
        url: '/users/:userId/edit',
        templateUrl: 'modules/users/client/views/admin/edit-user.client.view.html',
        controller: 'UserController',
        resolve: {
          userResolve: ['$stateParams', 'Admin', function ($stateParams, Admin) {
            return Admin.get({
              userId: $stateParams.userId
            });
          }]
        }
      });
  }
]);

'use strict';

// Config HTTP Error Handling
angular.module('users').config(['$httpProvider',
  function ($httpProvider) {
    // Set the httpProvider "not authorized" interceptor
    $httpProvider.interceptors.push(['$q', '$location', 'Authentication',
      function ($q, $location, Authentication) {
        return {
          responseError: function (rejection) {
            switch (rejection.status) {
              case 401:
                // Deauthenticate the global user
                Authentication.user = null;

                // Redirect to signin page
                $location.path('signin');
                break;
              case 403:
                // Add unauthorized behaviour
                break;
            }

            return $q.reject(rejection);
          }
        };
      }
    ]);
  }
]);

'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
  function ($stateProvider) {
    // Users state routing
    $stateProvider
      .state('settings', {
        abstract: true,
        url: '/settings',
        templateUrl: 'modules/users/client/views/settings/settings.client.view.html',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('settings.profile', {
        url: '/profile',
        templateUrl: 'modules/users/client/views/settings/edit-profile.client.view.html'
      })
      .state('settings.password', {
        url: '/password',
        templateUrl: 'modules/users/client/views/settings/change-password.client.view.html'
      })
      .state('settings.accounts', {
        url: '/accounts',
        templateUrl: 'modules/users/client/views/settings/manage-social-accounts.client.view.html'
      })
      .state('settings.picture', {
        url: '/picture',
        templateUrl: 'modules/users/client/views/settings/change-profile-picture.client.view.html'
      })
      .state('authentication', {
        abstract: true,
        url: '/authentication',
        templateUrl: 'modules/users/client/views/authentication/authentication.client.view.html'
      })
      .state('authentication.signup', {
        url: '/signup',
        templateUrl: 'modules/users/client/views/authentication/signup.client.view.html'
      })
      .state('authentication.signin', {
        url: '/signin?err',
        templateUrl: 'modules/users/client/views/authentication/signin.client.view.html'
      })
      .state('password', {
        abstract: true,
        url: '/password',
        template: '<ui-view/>'
      })
      .state('password.forgot', {
        url: '/forgot',
        templateUrl: 'modules/users/client/views/password/forgot-password.client.view.html'
      })
      .state('password.reset', {
        abstract: true,
        url: '/reset',
        template: '<ui-view/>'
      })
      .state('password.reset.invalid', {
        url: '/invalid',
        templateUrl: 'modules/users/client/views/password/reset-password-invalid.client.view.html'
      })
      .state('password.reset.success', {
        url: '/success',
        templateUrl: 'modules/users/client/views/password/reset-password-success.client.view.html'
      })
      .state('password.reset.form', {
        url: '/:token',
        templateUrl: 'modules/users/client/views/password/reset-password.client.view.html'
      });
  }
]);

'use strict';

angular.module('users.admin').controller('UserListController', ['$scope', '$filter', 'Admin',
  function ($scope, $filter, Admin) {
    Admin.query(function (data) {
      $scope.users = data;
      $scope.buildPager();
    });

    $scope.buildPager = function () {
      $scope.pagedItems = [];
      $scope.itemsPerPage = 15;
      $scope.currentPage = 1;
      $scope.figureOutItemsToDisplay();
    };

    $scope.figureOutItemsToDisplay = function () {
      $scope.filteredItems = $filter('filter')($scope.users, {
        $: $scope.search
      });
      $scope.filterLength = $scope.filteredItems.length;
      var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
      var end = begin + $scope.itemsPerPage;
      $scope.pagedItems = $scope.filteredItems.slice(begin, end);
    };

    $scope.pageChanged = function () {
      $scope.figureOutItemsToDisplay();
    };
  }
]);

'use strict';

angular.module('users.admin').controller('UserController', ['$scope', '$state', 'Authentication', 'userResolve',
  function ($scope, $state, Authentication, userResolve) {
    $scope.authentication = Authentication;
    $scope.user = userResolve;

    $scope.remove = function (user) {
      if (confirm('Are you sure you want to delete this user?')) {
        if (user) {
          user.$remove();

          $scope.users.splice($scope.users.indexOf(user), 1);
        } else {
          $scope.user.$remove(function () {
            $state.go('admin.users');
          });
        }
      }
    };

    $scope.update = function (isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      var user = $scope.user;

      user.$update(function () {
        $state.go('admin.user', {
          userId: user._id
        });
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$state', '$http', '$location', '$window', 'Authentication', 'PasswordValidator','Verifications', 'Profiles',
  function ($scope, $state, $http, $location, $window, Authentication, PasswordValidator, Verifications, Profiles) {
    $scope.authentication = Authentication;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();

    // Get an eventual error defined in the URL query string:
    $scope.error = $location.search().err;

    // If user is signed in then redirect back home
    if ($scope.authentication.user) {
      $location.path('/');
    }

    $scope.signup = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');
        return false;
      }

      Verifications.read($scope.credentials.registrationKey).then(function (response) {
        $scope.errorMsg = '';
        $scope.verification = response.data;
        $scope.credentials.roles = response.data.type;
        $http.post('/api/auth/signup', $scope.credentials).success(function (response) {
          // If successful we assign the response to the global user model
          $scope.authentication.user = response;
          //Once response is back, update the verification code in the DB to be inactive and assigned to the user
          Verifications.update(response.registrationKey, {
            'verification': {
              'code': response.registrationKey,
              'user_id': $scope.authentication.user._id,
              'active': false
            }
          }).then(function (response) {
                //Success
          }, function (error) {
               //Error
          });
          // And redirect to the profile creation page upon signup IF USER else Admin Dashboard
          if($scope.authentication.user.roles[0] === 'user'){
            $state.go('profile.create', $state.previous.params);
          }
          else{
            $state.go('admin.users', $state.previous.params);
          }
        }).error(function (response) {
          $scope.error = response.message;
        });
      }, function (error) {
        $scope.error = 'Invalid Registration Code "' + $scope.credentials.registrationKey + '"';
        return false;
      });
    };

    $scope.signin = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      $http.post('/api/auth/signin', $scope.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;

        // And redirect to the previous or home page
        if ($scope.authentication.user.roles[0] === 'user') {
          Profiles.get({ user: response._id }, function(result){
            if(result.Priority)
              $state.go('home', $state.previous.params);
            else
              $state.go('profile.create', $state.previous.params);
          });
        } else {
          $state.go('admin.users', $state.previous.params);
        }
      }).error(function (response) {
        $scope.error = response.message;
      });
    };

    // OAuth provider request
    $scope.callOauthProvider = function (url) {
      if ($state.previous && $state.previous.href) {
        url += '?redirect_to=' + encodeURIComponent($state.previous.href);
      }

      // Effectively call OAuth authentication route:
      $window.location.href = url;
    };
  }
]);

'use strict';

angular.module('users').controller('PasswordController', ['$scope', '$stateParams', '$http', '$location', 'Authentication', 'PasswordValidator',
  function ($scope, $stateParams, $http, $location, Authentication, PasswordValidator) {
    $scope.authentication = Authentication;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();

    //If user is signed in then redirect back home
    if ($scope.authentication.user) {
      $location.path('/');
    }

    // Submit forgotten password account id
    $scope.askForPasswordReset = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'forgotPasswordForm');

        return false;
      }

      $http.post('/api/auth/forgot', $scope.credentials).success(function (response) {
        // Show user success message and clear form
        $scope.credentials = null;
        $scope.success = response.message;

      }).error(function (response) {
        // Show user error message and clear form
        $scope.credentials = null;
        $scope.error = response.message;
      });
    };

    // Change user password
    $scope.resetUserPassword = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'resetPasswordForm');

        return false;
      }

      $http.post('/api/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.passwordDetails = null;

        // Attach user profile
        Authentication.user = response;

        // And redirect to the index page
        $location.path('/password/reset/success');
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('ChangePasswordController', ['$scope', '$http', 'Authentication', 'PasswordValidator',
  function ($scope, $http, Authentication, PasswordValidator) {
    $scope.user = Authentication.user;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();

    // Change user password
    $scope.changeUserPassword = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'passwordForm');

        return false;
      }

      $http.post('/api/users/password', $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.$broadcast('show-errors-reset', 'passwordForm');
        $scope.success = true;
        $scope.passwordDetails = null;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('ChangeProfilePictureController', ['$scope', '$timeout', '$window', 'Authentication', 'FileUploader',
  function ($scope, $timeout, $window, Authentication, FileUploader) {
    $scope.user = Authentication.user;
    $scope.imageURL = $scope.user.profileImageURL;

    // Create file uploader instance
    $scope.uploader = new FileUploader({
      url: 'api/users/picture',
      alias: 'newProfilePicture'
    });

    // Set file uploader image filter
    $scope.uploader.filters.push({
      name: 'imageFilter',
      fn: function (item, options) {
        var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
        return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
      }
    });

    // Called after the user selected a new picture file
    $scope.uploader.onAfterAddingFile = function (fileItem) {
      if ($window.FileReader) {
        var fileReader = new FileReader();
        fileReader.readAsDataURL(fileItem._file);

        fileReader.onload = function (fileReaderEvent) {
          $timeout(function () {
            $scope.imageURL = fileReaderEvent.target.result;
          }, 0);
        };
      }
    };

    // Called after the user has successfully uploaded a new picture
    $scope.uploader.onSuccessItem = function (fileItem, response, status, headers) {
      // Show success message
      $scope.success = true;

      // Populate user object
      $scope.user = Authentication.user = response;

      // Clear upload buttons
      $scope.cancelUpload();
    };

    // Called after the user has failed to uploaded a new picture
    $scope.uploader.onErrorItem = function (fileItem, response, status, headers) {
      // Clear upload buttons
      $scope.cancelUpload();

      // Show error message
      $scope.error = response.message;
    };

    // Change user profile picture
    $scope.uploadProfilePicture = function () {
      // Clear messages
      $scope.success = $scope.error = null;

      // Start upload
      $scope.uploader.uploadAll();
    };

    // Cancel the upload process
    $scope.cancelUpload = function () {
      $scope.uploader.clearQueue();
      $scope.imageURL = $scope.user.profileImageURL;
    };
  }
]);

'use strict';

angular.module('users').controller('EditProfileController', ['$scope', '$http', '$location', 'Users', 'Authentication',
  function ($scope, $http, $location, Users, Authentication) {
    $scope.user = Authentication.user;

    // Update a user profile
    $scope.updateUserProfile = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      var user = new Users($scope.user);

      user.$update(function (response) {
        $scope.$broadcast('show-errors-reset', 'userForm');

        $scope.success = true;
        Authentication.user = response;
      }, function (response) {
        $scope.error = response.data.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('SocialAccountsController', ['$scope', '$http', 'Authentication',
  function ($scope, $http, Authentication) {
    $scope.user = Authentication.user;

    // Check if there are additional accounts
    $scope.hasConnectedAdditionalSocialAccounts = function (provider) {
      for (var i in $scope.user.additionalProvidersData) {
        return true;
      }

      return false;
    };

    // Check if provider is already in use with current user
    $scope.isConnectedSocialAccount = function (provider) {
      return $scope.user.provider === provider || ($scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider]);
    };

    // Remove a user social account
    $scope.removeUserSocialAccount = function (provider) {
      $scope.success = $scope.error = null;

      $http.delete('/api/users/accounts', {
        params: {
          provider: provider
        }
      }).success(function (response) {
        // If successful show success message and clear form
        $scope.success = true;
        $scope.user = Authentication.user = response;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);

'use strict';

angular.module('users').controller('SettingsController', ['$scope', 'Authentication',
  function ($scope, Authentication) {
    $scope.user = Authentication.user;
  }
]);

'use strict';

angular.module('users')
  .directive('passwordValidator', ['PasswordValidator', function(PasswordValidator) {
    return {
      require: 'ngModel',
      link: function(scope, element, attrs, ngModel) {
        ngModel.$validators.requirements = function (password) {
          var status = true;
          if (password) {
            var result = PasswordValidator.getResult(password);
            var requirementsIdx = 0;

            // Requirements Meter - visual indicator for users
            var requirementsMeter = [
              { color: 'danger', progress: '20' },
              { color: 'warning', progress: '40' },
              { color: 'info', progress: '60' },
              { color: 'primary', progress: '80' },
              { color: 'success', progress: '100' }
            ];

            if (result.errors.length < requirementsMeter.length) {
              requirementsIdx = requirementsMeter.length - result.errors.length - 1;
            }

            scope.requirementsColor = requirementsMeter[requirementsIdx].color;
            scope.requirementsProgress = requirementsMeter[requirementsIdx].progress;

            if (result.errors.length) {
              scope.popoverMsg = PasswordValidator.getPopoverMsg();
              scope.passwordErrors = result.errors;
              status = false;
            } else {
              scope.popoverMsg = '';
              scope.passwordErrors = [];
              status = true;
            }
          }
          return status;
        };
      }
    };
  }]);

'use strict';

angular.module('users')
  .directive('passwordVerify', [function() {
    return {
      require: 'ngModel',
      scope: {
        passwordVerify: '='
      },
      link: function(scope, element, attrs, ngModel) {
        var status = true;
        scope.$watch(function() {
          var combined;
          if (scope.passwordVerify || ngModel) {
            combined = scope.passwordVerify + '_' + ngModel;
          }
          return combined;
        }, function(value) {
          if (value) {
            ngModel.$validators.passwordVerify = function (password) {
              var origin = scope.passwordVerify;
              return (origin !== password) ? false : true;
            };
          }
        });
      }
    };
  }]);

'use strict';

// Users directive used to force lowercase input
angular.module('users').directive('lowercase', function () {
  return {
    require: 'ngModel',
    link: function (scope, element, attrs, modelCtrl) {
      modelCtrl.$parsers.push(function (input) {
        return input ? input.toLowerCase() : '';
      });
      element.css('text-transform', 'lowercase');
    }
  };
});

'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', ['$window',
  function ($window) {
    var auth = {
      user: $window.user
    };

    return auth;
  }
]);

'use strict';

// PasswordValidator service used for testing the password strength
angular.module('users').factory('PasswordValidator', ['$window',
  function ($window) {
    var owaspPasswordStrengthTest = $window.owaspPasswordStrengthTest;

    return {
      getResult: function (password) {
        var result = owaspPasswordStrengthTest.test(password);
        return result;
      },
      getPopoverMsg: function () {
        var popoverMsg = 'Please enter a passphrase or password with greater than 10 characters, numbers, lowercase, upppercase, and special characters.';
        return popoverMsg;
      }
    };
  }
]);

'use strict';

// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', ['$resource',
  function ($resource) {
    return $resource('api/users', {}, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

//TODO this should be Users service
angular.module('users.admin').factory('Admin', ['$resource',
  function ($resource) {
    return $resource('api/users/:userId', {
      userId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

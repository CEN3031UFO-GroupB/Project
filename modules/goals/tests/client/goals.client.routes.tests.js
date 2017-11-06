(function () {
  'use strict';

  describe('Goals Route Tests', function () {
    // Initialize global variables
    var $scope,
      GoalsService;

    // We can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($rootScope, _GoalsService_) {
      // Set a new global scope
      $scope = $rootScope.$new();
      GoalsService = _GoalsService_;
    }));

    describe('Route Config', function () {
      describe('Main Route', function () {
        var mainstate;
        beforeEach(inject(function ($state) {
          mainstate = $state.get('goals');
        }));

        it('Should have the correct URL', function () {
          expect(mainstate.url).toEqual('/goals');
        });

        it('Should be abstract', function () {
          expect(mainstate.abstract).toBe(true);
        });

        it('Should have template', function () {
          expect(mainstate.template).toBe('<ui-view/>');
        });
      });

      describe('View Route', function () {
        var viewstate,
          GoalsController,
          mockGoal;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          viewstate = $state.get('goals.view');
          $templateCache.put('modules/goals/client/views/view-goal.client.view.html', '');

          // create mock Goal
          mockGoal = new GoalsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Goal Name'
          });

          // Initialize Controller
          GoalsController = $controller('GoalsController as vm', {
            $scope: $scope,
            goalResolve: mockGoal
          });
        }));

        it('Should have the correct URL', function () {
          expect(viewstate.url).toEqual('/:goalId');
        });

        it('Should have a resolve function', function () {
          expect(typeof viewstate.resolve).toEqual('object');
          expect(typeof viewstate.resolve.goalResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(viewstate, {
            goalId: 1
          })).toEqual('/goals/1');
        }));

        it('should attach an Goal to the controller scope', function () {
          expect($scope.vm.goal._id).toBe(mockGoal._id);
        });

        it('Should not be abstract', function () {
          expect(viewstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(viewstate.templateUrl).toBe('modules/goals/client/views/view-goal.client.view.html');
        });
      });

      describe('Create Route', function () {
        var createstate,
          GoalsController,
          mockGoal;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          createstate = $state.get('goals.create');
          $templateCache.put('modules/goals/client/views/form-goal.client.view.html', '');

          // create mock Goal
          mockGoal = new GoalsService();

          // Initialize Controller
          GoalsController = $controller('GoalsController as vm', {
            $scope: $scope,
            goalResolve: mockGoal
          });
        }));

        it('Should have the correct URL', function () {
          expect(createstate.url).toEqual('/create');
        });

        it('Should have a resolve function', function () {
          expect(typeof createstate.resolve).toEqual('object');
          expect(typeof createstate.resolve.goalResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(createstate)).toEqual('/goals/create');
        }));

        it('should attach an Goal to the controller scope', function () {
          expect($scope.vm.goal._id).toBe(mockGoal._id);
          expect($scope.vm.goal._id).toBe(undefined);
        });

        it('Should not be abstract', function () {
          expect(createstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(createstate.templateUrl).toBe('modules/goals/client/views/form-goal.client.view.html');
        });
      });

      describe('Edit Route', function () {
        var editstate,
          GoalsController,
          mockGoal;

        beforeEach(inject(function ($controller, $state, $templateCache) {
          editstate = $state.get('goals.edit');
          $templateCache.put('modules/goals/client/views/form-goal.client.view.html', '');

          // create mock Goal
          mockGoal = new GoalsService({
            _id: '525a8422f6d0f87f0e407a33',
            name: 'Goal Name'
          });

          // Initialize Controller
          GoalsController = $controller('GoalsController as vm', {
            $scope: $scope,
            goalResolve: mockGoal
          });
        }));

        it('Should have the correct URL', function () {
          expect(editstate.url).toEqual('/:goalId/edit');
        });

        it('Should have a resolve function', function () {
          expect(typeof editstate.resolve).toEqual('object');
          expect(typeof editstate.resolve.goalResolve).toEqual('function');
        });

        it('should respond to URL', inject(function ($state) {
          expect($state.href(editstate, {
            goalId: 1
          })).toEqual('/goals/1/edit');
        }));

        it('should attach an Goal to the controller scope', function () {
          expect($scope.vm.goal._id).toBe(mockGoal._id);
        });

        it('Should not be abstract', function () {
          expect(editstate.abstract).toBe(undefined);
        });

        it('Should have templateUrl', function () {
          expect(editstate.templateUrl).toBe('modules/goals/client/views/form-goal.client.view.html');
        });

        xit('Should go to unauthorized route', function () {

        });
      });

    });
  });
}());

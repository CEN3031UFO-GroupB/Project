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

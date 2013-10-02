/*global define, angular */

'use strict';

// Declare here that angular is the US version - other locales can be easily substituted.
define('ui.bootstrap', ['webjars!ui-bootstrap.js'], function(uibootstrap) {return uibootstrap;});

define('angular', ['webjars!angular-locale_en-us.js','webjars!angular-resource.js', 'webjars!angular-cookies.js'], function() {
    return angular;
});

require(['angular', , 'ui.bootstrap', './controllers', './directives', './filters', './services', './dragon-drop'],
  function(angular) {

// Declare app level module which depends on filters, and services

angular.module('myApp', ['myApp.filters', 'myApp.services', 'myApp.directives', 'ngResource', 'ngCookies' , 'ui.bootstrap', 'btford.dragon-drop']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/levelpacks', {templateUrl: 'partials/levelpacks.html', controller: LevelPacksCtrl});
    $routeProvider.when('/levelpack/:levelPack', {templateUrl: 'partials/levelpack.html', controller: LevelPackCtrl});
    $routeProvider.when('/levelpack/:levelPack/level/:level', {templateUrl: 'partials/level.html', controller: LevelCtrl});
    $routeProvider.otherwise({redirectTo: '/levelpacks'});
}]);


angular.bootstrap(document, ['myApp']);

});

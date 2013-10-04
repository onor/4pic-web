/*global define, angular */

'use strict';

// Declare here that angular is the US version - other locales can be easily substituted.
define('ui.bootstrap', ['webjars!ui-bootstrap.js'], function(uibootstrap) {return uibootstrap;});

define('4picword.config', ['config/angular'], function(config) {return config;});

define('angular', ['webjars!angular-locale_en-us.js','webjars!angular-resource.js', 'webjars!angular-cookies.js'], function() {
    return angular;
});

require(['angular', 'ui.bootstrap', './controllers', './directives', './filters', './services', './angular-facebook.min', '4picword.config'],
  function(angular) {

// Declare app level module which depends on filters, and services

angular.module('myApp', ['myApp.filters', 'myApp.services', 'myApp.directives', 'ngResource', 'ngCookies' , 'ui.bootstrap', 'facebook']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/splash', {templateUrl: 'partials/splash.html', controller: SplashCtrl});
    $routeProvider.when('/prize', {templateUrl: 'partials/prize.html', controller: PrizeCtrl});
    $routeProvider.when('/prize/list', {templateUrl: 'partials/prize-list.html', controller: PrizeListCtrl});
    $routeProvider.when('/leaderboard/:levelPack', {templateUrl: 'partials/leaderboard.html', controller: LeaderboardCtrl});
    $routeProvider.when('/levelpack/:levelPack/level/:level', {templateUrl: 'partials/level.html', controller: LevelCtrl});
    $routeProvider.otherwise({redirectTo: '/splash'});
  }]).
  config(['$facebookProvider', function($facebookProvider) {
        $facebookProvider.init({
            appId: appConfig.appId//,
            //channel: '//path/to/channel.html'
        });
  }]);


angular.bootstrap(document, ['myApp']);

});

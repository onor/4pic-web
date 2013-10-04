/*global define, angular */

'use strict';

// Declare here that angular is the US version - other locales can be easily substituted.
define('ui.bootstrap', ['webjars!ui-bootstrap.js'], function(uibootstrap) {return uibootstrap;});

define('angular', ['webjars!angular-locale_en-us.js','webjars!angular-resource.js', 'webjars!angular-cookies.js'], function() {
    return angular;
});

require(['angular', 'ui.bootstrap', './controllers', './directives', './filters', './services', './angular-facebook.min'],
  function(angular) {

// Declare app level module which depends on filters, and services

angular.module('myApp', ['myApp.filters', 'myApp.services', 'myApp.directives', 'ngResource', 'ngCookies' , 'ui.bootstrap', 'facebook']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/splash', {templateUrl: 'partials/splash.html', controller: SplashCtrl});
    $routeProvider.when('/prize', {templateUrl: 'partials/prize.html', controller: PrizeCtrl});
    $routeProvider.when('/leaderboard/:levelPack', {templateUrl: 'partials/leaderboard.html', controller: LeaderboardCtrl});
    $routeProvider.when('/levelpack/:levelPack/level/:level', {templateUrl: 'partials/level.html', controller: LevelCtrl});
    $routeProvider.otherwise({redirectTo: '/splash'});
  }]).
  config(['$facebookProvider', function($facebookProvider) {
        $facebookProvider.init({
            appId: '304111289726859'//,
            //channel: '//path/to/channel.html'
        });
  }]);


angular.bootstrap(document, ['myApp']);

});

(function() {

    /*global define, angular */

'use strict';

requirejs.config({
    shim : {
        "webjars!angular-cookies.js" : ["angular"], // make angular available to ngCookies,
        "webjars!angular-route.js" : ["angular"], // make angular available to ngRoute
        "webjars!angular-resource.js" : ["angular"], // make angular available to ngResource
        "webjars!angular-animate.js" : ["angular"], // make angular available to ngAnimate
    },
    priority: ["angular"] // Make sure angular is loaded first
});

// Declare here that angular is the US version - other locales can be easily substituted.
define('ui.bootstrap', ['webjars!ui-bootstrap.js'], function(uibootstrap) {return uibootstrap;});

define('4picword.config', ['config/angular'], function(config) {return config;});

define('angular', ['webjars!angular.js'], function() {
    return angular;
});

require(['angular', 'ui.bootstrap', './controllers', './directives', './filters', './services', './angular-facebook.min', '4picword.config',
    "webjars!angular-cookies.js", "webjars!angular-resource.js", "webjars!angular-route.js", "webjars!angular-animate.js", "webjars!underscore.js"],
  function(angular) {

// Declare app level module which depends on filters, and services

angular.module('myApp', ['myApp.filters', 'myApp.services', 'myApp.directives', 'ngResource', 'ngCookies', 'ngRoute' , 'ngAnimate', 'ui.bootstrap', 'facebook']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/splash', {templateUrl: 'partials/splash.html', controller: SplashCtrl});
    $routeProvider.when('/prize', {templateUrl: 'partials/prize.html', controller: PrizeCtrl});
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

})();

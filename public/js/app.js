(function () {

	/*global define, angular */

	'use strict';

	requirejs.config({
		shim: {
			"angular-route": ["angular"], // make angular available to ngRoute
			"angular-resource": ["angular"], // make angular available to ngResource
			"angular-animate": ["angular"], // make angular available to ngAnimate
			"ui-bootstrap-tpls": ["angular"]
		},
		paths: {
      "_" : "//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.1/underscore-min",
      "ui-bootstrap-tpls" : "//cdnjs.cloudflare.com/ajax/libs/angular-ui-bootstrap/0.6.0/ui-bootstrap-tpls.min"
    },
		priority: ["angular"] // Make sure angular is loaded first
	});

	define("angular-animate", ["webjars!angular-animate.js"], function() {});
  define("angular-resource", ["webjars!angular-resource.js"], function() {});
	define("angular-route", ["webjars!angular-route.js"], function() {});
	define('angular', ['webjars!angular.js'], function () {return angular;});

	require(['angular', "ui-bootstrap-tpls", './controllers', './directives', './filters', './services',
	'./angular-facebook.min', 'angular-timer.min', "angular-resource", "angular-route", "angular-animate", "_"],
		function (angular) {

			angular.module('myApp', ['myApp.filters', 'myApp.services', 'myApp.directives', 'ngResource', 'ngRoute' , 'ngAnimate', 'ui.bootstrap', 'facebook', 'timer']).
				config(['$routeProvider', function ($routeProvider) {
					$routeProvider.when('/splash', {templateUrl: '../../partials/splash.html', controller: SplashCtrl});
					$routeProvider.when('/prize', {templateUrl: '../../partials/prize.html', controller: PrizeCtrl});
					$routeProvider.when('/charity', {templateUrl: '../../partials/charity.html', controller: CharityCtrl});
					//todo: levelPack and level url parameters are not needed anymore. except for bugfix on level reloading on next button.
					$routeProvider.when('/leaderboard/:levelPack', {templateUrl: '../../partials/leaderboard.html', controller: LeaderboardCtrl});
					$routeProvider.when('/levelpack/:levelPack/level/:level', {templateUrl: '../../partials/level.html', controller: LevelCtrl});
					$routeProvider.otherwise({redirectTo: '/splash'});
				}]).
				config(['$facebookProvider', function ($facebookProvider) {
					$facebookProvider.init({
						appId: appConfig.appId//,
						//channel: '//path/to/channel.html'  todo: what is channel?
					});
				}]);

			angular.bootstrap(document, ['myApp']);

		});

})();

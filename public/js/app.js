(function () {

	/*global define, angular */

	'use strict';

	requirejs.config({
		shim: {
			"webjars!angular-cookies.js": ["angular"], // make angular available to ngCookies,
			"webjars!angular-route.js": ["angular"], // make angular available to ngRoute
			"webjars!angular-resource.js": ["angular"], // make angular available to ngResource
			"webjars!angular-animate.js": ["angular"], // make angular available to ngAnimate
			"webjars!ui-bootstrap-tpls.js": ["angular"]
		},
		priority: ["angular"] // Make sure angular is loaded first
	});

// Declare here that angular is the US version - other locales can be easily substituted.
	define('angular', ['webjars!angular.js'], function () {
		return angular;
	});

	require(['angular', "webjars!ui-bootstrap-tpls.js", './controllers', './directives', './filters', './services', './angular-facebook.min', 'angular-timer.min',
		"webjars!angular-cookies.js", "webjars!angular-resource.js", "webjars!angular-route.js", "webjars!angular-animate.js", "webjars!underscore.js"],
		function (angular) {

			angular.module('myApp', ['myApp.filters', 'myApp.services', 'myApp.directives', 'ngResource', 'ngCookies', 'ngRoute' , 'ngAnimate', 'ui.bootstrap', 'facebook', 'timer']).
				config(['$routeProvider', function ($routeProvider) {
					$routeProvider.when('/splash', {templateUrl: '/partials/splash.html', controller: SplashCtrl});
					$routeProvider.when('/prize', {templateUrl: '/partials/prize.html', controller: PrizeCtrl});
					$routeProvider.when('/charity', {templateUrl: '/partials/charity.html', controller: CharityCtrl});
					$routeProvider.when('/leaderboard/:levelPack', {templateUrl: '/partials/leaderboard.html', controller: LeaderboardCtrl});
					$routeProvider.when('/levelpack/:levelPack/level/:level', {templateUrl: '/partials/level.html', controller: LevelCtrl});
					$routeProvider.otherwise({redirectTo: '/splash'});
				}]).
				config(['$facebookProvider', function ($facebookProvider) {
					$facebookProvider.init({
						appId: appConfig.appId//,
						//channel: '//path/to/channel.html'
					});
				}]);

			angular.bootstrap(document, ['myApp']);

		});

})();

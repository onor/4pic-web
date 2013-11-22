 (function () {
 
 	/*global define, angular */
 
 	'use strict';
 //todo package everything even angular ad dependent libraries in one file
 	requirejs.config({
 		shim: {
 			"angular-route": ["angular"], // make angular available to ngRoute
 			"angular-resource": ["angular"], // make angular available to ngResource
 			"angular-animate": ["angular"], // make angular available to ngAnimate
 			"ui-bootstrap-tpls": ["angular"]
 		},
 		paths: {
      "underscorejs" : "//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.1/underscore-min",
      "ui-bootstrap-tpls" : "//cdnjs.cloudflare.com/ajax/libs/angular-ui-bootstrap/0.6.0/ui-bootstrap-tpls.min",
			"angular-animate" : "https://ajax.googleapis.com/ajax/libs/angularjs/1.2.0/angular-animate.min",
		  "angular-resource" : "https://ajax.googleapis.com/ajax/libs/angularjs/1.2.0/angular-resource.min",
			"angular-route" : ["https://ajax.googleapis.com/ajax/libs/angularjs/1.2.0/angular-route.min"]
     },
 		priority: ["angular"] // Make sure angular is loaded first
 	});

	define('angular', ['https://ajax.googleapis.com/ajax/libs/angularjs/1.2.0/angular.min.js'], function () {return angular;});
 
 	require(['angular', "ui-bootstrap-tpls", './controllers.min', './directives.min', './filters.min', './services.min',
 	'./angular-facebook.min', 'angular-timer.min', "angular-resource", "angular-route", "angular-animate", "underscorejs"],
 		function (angular, xxx, controllers) {
 
 			angular.module('myApp', ['myApp.filters', 'myApp.services', 'myApp.directives', 'ngResource', 'ngRoute' , 'ngAnimate', 'ui.bootstrap', 'facebook', 'timer']).
 				config(['$routeProvider', function ($routeProvider) {
 					$routeProvider.when('/splash', {templateUrl: '../../partials/splash.html', controller: controllers.SplashCtrl});
 					$routeProvider.when('/prize', {templateUrl: '../../partials/prize.html', controller: controllers.PrizeCtrl});
 					$routeProvider.when('/charity', {templateUrl: '../../partials/charity.html', controller: controllers.CharityCtrl});
 					//todo: levelPack and level url parameters are not needed anymore. except for bugfix on level reloading on next button.
 					$routeProvider.when('/leaderboard', {templateUrl: '../../partials/leaderboard.html', controller: controllers.LeaderboardCtrl});
 					$routeProvider.when('/level', {templateUrl: '../../partials/level.html', controller: controllers.LevelCtrl});
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

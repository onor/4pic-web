 (function () {
 
 	/*global define, angular */
 
 	'use strict';
 //todo package everything even angular ad dependent libraries in one file
 	requirejs.config({
 		shim: {
 			"angular-route": ["angular"], // make angular available to ngRoute
 			"angular-resource": ["angular"], // make angular available to ngResource
 			"angular-animate": ["angular"], // make angular available to ngAnimate
 			"angulartics": ["angular"],
 			"angulartics.google.analytics": ["angular"]
 		},
 		paths: {
 			"angulartics" : "angulartics.min",
 			"angulartics.google.analytics" : "angulartics-google-analytics.min",
      		"underscorejs" : "//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.1/underscore-min",
			"angular-animate" : "https://ajax.googleapis.com/ajax/libs/angularjs/1.2.0/angular-animate.min",
		  	"angular-resource" : "https://ajax.googleapis.com/ajax/libs/angularjs/1.2.0/angular-resource.min",
			"angular-route" : ["https://ajax.googleapis.com/ajax/libs/angularjs/1.2.0/angular-route.min"]
     },
 		priority: ["angular"] // Make sure angular is loaded first
 	});

	define('angular', ['https://ajax.googleapis.com/ajax/libs/angularjs/1.2.0/angular.min.js'], function () {return angular;});
 
 	require(['angular', './controllers', './directives', './filters.min', './services.min',
 	'./angular-facebook.min', 'angular-timer.min', "angular-resource", "angular-route", "angular-animate", "underscorejs", "angulartics", "angulartics.google.analytics"],
 		function (angular, controllers) {
 
 			angular.module('myApp', ['myApp.filters', 'myApp.services', 'myApp.directives', 'ngResource', 'ngRoute' , 'ngAnimate', 'facebook', 'timer', 'angulartics', 'angulartics.google.analytics']).
 				config(['$routeProvider', function ($routeProvider) {
 					$routeProvider.when('/heart', {templateUrl: '../../partials/heart.html', controller: controllers.HeartCtrl})
 					$routeProvider.when('/splash', {templateUrl: '../../partials/splash.html', controller: controllers.SplashCtrl});
 					$routeProvider.when('/prize', {templateUrl: '../../partials/prize.html', controller: controllers.PrizeCtrl});
 					$routeProvider.when('/charity', {templateUrl: '../../partials/charity.html', controller: controllers.CharityCtrl});
 					$routeProvider.when('/leaderboard', {templateUrl: '../../partials/leaderboard.html', controller: controllers.LeaderboardCtrl});
 					$routeProvider.when('/level', {templateUrl: '../../partials/level.html', controller: controllers.LevelCtrl});
 					$routeProvider.otherwise({redirectTo: '/splash'});
 				}]).
 				config(['$facebookProvider', function ($facebookProvider) {
 					$facebookProvider.init({
 						appId: appConfig.appId//,
 						//channel: '//path/to/channel.html'  todo: what is channel?
 					});
 				}]).config(function ($httpProvider) {
 						$httpProvider.defaults.headers.common = {
 							'Accept': 'application/json, text/plain, */*',
 		 					'userKey' : '4b1469e3ff90b438ef0134b1cb266c06',
 		 					'gameKey' : appConfig.gameKey,
 		 					'fbid' : appConfig.fbid
 		 				}; 					
 				}).run(function () {
 					  /*! matchMedia() polyfill - Test a CSS media type/query in JS.
 					   * Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas, David Knight.
 					   * Dual MIT/BSD license
 					  **/

 					  window.matchMedia || (window.matchMedia = function() {
 					    "use strict";

 					    // For browsers that support matchMedium api such as IE 9 and webkit
 					    var styleMedia = (window.styleMedia || window.media);

 					    // For those that don't support matchMedium
 					    if (!styleMedia) {
 					      var style       = document.createElement('style'),
 					        script      = document.getElementsByTagName('script')[0],
 					        info        = null;

 					      style.type  = 'text/css';
 					      style.id    = 'matchmediajs-test';

 					      script.parentNode.insertBefore(style, script);

 					      // 'style.currentStyle' is used by IE <= 8
 					      // 'window.getComputedStyle' for all other browsers
 					      info = ('getComputedStyle' in window) 
 					        && window.getComputedStyle(style, null)
 					        || style.currentStyle;

 					      styleMedia = {
 					        matchMedium: function(media) {
 					          var text = '@media ' + media + '{ #matchmediajs-test { width: 1px; } }';

 					          // 'style.styleSheet' is used by IE <= 8
 					          // 'style.textContent' for all other browsers
 					          if (style.styleSheet) {
 					            style.styleSheet.cssText = text;
 					          } else {
 					            style.textContent = text;
 					          }

 					          // Test if media query is true or false
 					          return info.width === '1px';
 					        }
 					      };
 					    }

 					    return function(media) {
 					      return {
 					        matches: styleMedia.matchMedium(media || 'all'),
 					        media: media || 'all'
 					      };
 					    };
 					  }());
 					})


 					// takes a comma-separated list of screen sizes to match.
 					// returns true if any of them match.
 					.service('screenSize', function () {
 					  'use strict';

 					  var rules = {
 					    large : '(min-width:64.063em)',
 					    medium : '(min-width:40.063em) and (max-width:64em)',
 					    small : '(max-width: 40em)'
 					  };

 					  this.rules = rules;

 					  this.is = function (list) {
 					    // validate that we're getting a string or array.
 					    if (typeof list !== 'string' && typeof list !== 'array') {
 					      throw new Error('screenSize requires array or comma-separated list');
 					    }

 					    // if it's a string, convert to array.
 					    if (typeof list === 'string') {
 					      list = list.split(/\s*,\s*/);
 					    }

 					    return list.some(function (size, index, arr) {
 					      if ( window.matchMedia(rules[size]).matches ) {
 					        return true;
 					      }
 					    });
 					  };
 					});
 
 			angular.bootstrap(document, ['myApp']);
 
 		});
 
 })();

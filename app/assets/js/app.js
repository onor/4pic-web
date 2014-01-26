 			angular.module('myApp', ['myApp.filters', 'myApp.services', 'myApp.directives', 'ngResource', 'ngRoute' , 'ngAnimate', 'facebook', 'timer', 'angulartics', 'angulartics.google.analytics']).
 				config(['$routeProvider', function ($routeProvider) {
 					$routeProvider.when('/heart', {templateUrl: '../../partials/heart.html', controller: HeartCtrl})
 					$routeProvider.when('/splash', {templateUrl: '../../partials/splash.html', controller: SplashCtrl});
 					$routeProvider.when('/prize', {templateUrl: '../../partials/prize.html', controller: PrizeCtrl});
 					$routeProvider.when('/charity', {templateUrl: '../../partials/charity.html', controller: CharityCtrl});
 					$routeProvider.when('/leaderboard', {templateUrl: '../../partials/leaderboard.html', controller: LeaderboardCtrl});
 					$routeProvider.when('/level', {templateUrl: '../../partials/level.html', controller: LevelCtrl});
 					$routeProvider.otherwise({redirectTo: '/splash'});
 				}]).
 				config(['$facebookProvider', function ($facebookProvider) {
 					$facebookProvider.init({
 						appId: appConfig.appId,
 						status     : true,
 					    cookie     : true,
 					    xfbml      : true
 					});
 				}]).config(function ($httpProvider) {
 						$httpProvider.defaults.headers.common = {
 							'Accept': 'application/json, text/plain, */*',
 		 					'userKey' : '4b1469e3ff90b438ef0134b1cb266c06',
 		 					'gameKey' : appConfig.gameKey,
 		 					'fbid' : appConfig.fbid
 		 				}; 					
 				}).run(function($rootScope, $location, $timeout){
 					
 					$rootScope.$on('$viewContentLoaded', function () {
 				        $(document).foundation();
 				       
 				    });
               		$rootScope.$on('$routeChangeStart', function(event, next, current){
             
             
             		  });
    			$rootScope.$on('$locationChangeSuccess', function(){
    				console.log("Current 1: " + $location.path());
    		    $rootScope.actualLocation = $location.path();
    		});

   			 $rootScope.$watch(function() {return $location.path()}, function(newLocation, oldLocation){
   			     if($rootScope.actualLocation == newLocation){
   			     	console.log("redirecting to Splash on Browser Back");
					window.location.reload();
					return false;
        		}
    		});

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
  
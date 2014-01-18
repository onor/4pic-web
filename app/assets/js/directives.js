/*global define */

'use strict';


	/* Directives */



	angular.module('myApp.directives', []).directive('imageonload', function () {
		return {
			restrict: 'A',
			link: function (scope, element, attrs) {
				element.bind('load', function () {
					console.log("image loaded");
					scope.$emit("levelimageloaded");
				});
			}
		};
	}).directive('resize', function($document, $window) {
		return function (scope, element) {
		    var d = angular.element($document);
		    var w = angular.element($window);
		    var el = angular.element(element);

		    scope.getWindowDimensions = function () {
		        return { 'h': w.height(), 'w': w.width() };
		    };
		    scope.getDocumentDimensions = function() {
		    	return { 'h': d.height(), 'w': d.width() };
		    };
		    scope.getElementDimensions = function(element) {
		    	if (el.find('.heart-mask').length === 1) {
		    		el = el.find('.heart-mask').first();
		    	}
		    	return { 'h': el.height(), 'w': el.width() };
		    };
		    scope.$watch(scope.getElementDimensions, function (newValue, oldValue) {
		        scope.elHeight = newValue.h;
		        scope.elWidth = newValue.w;

		        scope.style = function () {
		            return {
		                'height': (newValue.h - 100) + 'px',
		                'width': (newValue.w - 100) + 'px'
		            };
		        };

		    }, true);
		    scope.$watch(scope.getWindowDimensions, function (newValue, oldValue) {
		        scope.windowHeight = newValue.h;
		        scope.windowWidth = newValue.w;

		        scope.style = function () {
		            return {
		                'height': (newValue.h - 100) + 'px',
		                'width': (newValue.w - 100) + 'px'
		            };
		        };

		    }, true);
		    scope.$watch(scope.getDocumentDimensions, function (newValue, oldValue) {
		        scope.documentHeight = newValue.h;
		        scope.documentWidth = newValue.w;

		        scope.style = function () {
		            return {
		                'height': (newValue.h - 100) + 'px',
		                'width': (newValue.w - 100) + 'px'
		            };
		        };

		    }, true);

		    w.bind('resize', function () {
		        scope.$apply();
		    });
		}
	}).directive('fbothersplayed', function ($facebook) {
		return {
			restrict: 'A',
			templateUrl: '../partials/fbothersplayed.html',
			scope: {
				onLogin: '='
			},
			link: function (scope) {
				scope.$watch('onLogin', function(){
					if (scope.onLogin){
						$facebook.api({
							method: 'fql.query',
							query: 'SELECT uid, name, is_app_user, pic_square FROM user WHERE uid IN (SELECT uid2 FROM friend WHERE uid1 = me()) AND is_app_user = 1'
						}).then(function (friends) {
							scope.friendsWhoHavePlayed = friends;
						});
					}
				});
			}
		};
	});

/*global define */

'use strict';

define(['angular'], function (angular) {

	/* Directives */
	

	
	angular.module('myApp.directives', []).directive('imageonload', function () {
		return {
			restrict: 'A',
			link: function (scope, element, attrs) {
				element.bind('load', function () {
					scope.$emit("levelimageloaded");
				});
			}
		};
	}).directive('fbprofilepic', function ($facebook) {
		return {
			restrict: 'A',
			replace: true,
			template: '<img ng-src="{{profPicUrl}}">',
			link: function (scope, element, attrs) {
				scope.$watch('onLogin', function(){
					if (scope.onLogin){
						$facebook.getLoginStatus().then(function(response){
							response.status === "connected" && $facebook.api('/me?fields=id,name,picture').then(function (me) {
								scope.profPicUrl = me.picture.data.url;
							});
						});
					}
				});
			}
		};
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
});
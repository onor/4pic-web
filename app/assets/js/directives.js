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
			restrict: 'E',
			template: '<img class="circle profile-pic" src="{{profPicUrl}}">',
			link: function (scope, element, attrs) {
				$facebook.getLoginStatus().then(function(response){
					response.status === "connected" && $facebook.api('/me?fields=id,name,picture').then(function (me) {
						scope.profPicUrl = me.picture.data.url;
					});
				});
			}
		};
	});
});
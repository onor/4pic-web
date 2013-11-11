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
	});
});
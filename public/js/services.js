/*global define */

'use strict';

define(['angular'], function (angular) {

	/* Services */

	angular.module('myApp.services', ['ngResource']).
		value('version', '0.1').factory('Game',function ($resource) {
			return $resource(
				"/game"
			);
		}).factory('Campaign',function ($resource) {
			return $resource(
				"/campaigns"
			);
		}).factory('Charity',function ($resource) {
			return $resource(
				"/charities"
			);
		}).factory('Votes',function ($resource) {
			return $resource(
				"/charityvotes"
			);
		}).factory('Score',function ($resource) {
			return $resource(
				"/scores/:fbid"
			);
		}).factory('State', function ($resource) {
			return $resource(
				"/states/:points:docController/:hint", {},
				{
					resolveLevel: {
						method: 'PUT'
					},
					seenLevel: {
						params: {docController: "seen"},
						method: 'PUT'
					},
					hint: {
						method: 'PUT',
						params: {docController: "hint"}
					}
				}
			);
		});
});
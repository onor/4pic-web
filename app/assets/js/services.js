/*global define */

'use strict';

define(['angular'], function (angular) {

	/* Services */
	var onorUrl = appConfig.onorUrl;

	angular.module('myApp.services', ['ngResource']).
		value('version', '0.1').factory('Game',function ($resource) {
			return $resource(
				onorUrl + "/client/v1/games/4pics1word/" + appConfig.gameKey,
				{
					userKey:'4b1469e3ff90b438ef0134b1cb266c06'
				}
			);
		}).factory('Campaign',function ($resource) {
			return $resource(
				onorUrl + "/client/v2/campaigns?page=1&perPage=3"
			);
		}).factory('Charity',function ($resource) {
			return $resource(
				onorUrl + "/client/v1/charities?page=1&perPage=3"
			);
		}).factory('Votes',function ($resource) {
			return $resource(
				onorUrl + "/client/v1/charityvotes"
			);
		}).factory('Score',function ($resource) {
			return $resource(
				onorUrl + "/client/v1/scores/:fbid"
			);
		}).factory('PrizeCode', function($resource) {
			return $resource(
			    onorUrl + '/client/v1/prizecode'
			)
		}).factory('State', function ($resource) {
			return $resource(
				onorUrl + "/client/v1/games/lpgame/:points:docController/:hint", {},
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
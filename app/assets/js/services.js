	/*global define */

'use strict';


	/* Services */
	var onorUrl = appConfig.onorUrl;

	angular.module('myApp.services', ['ngResource']).
		value('version', '0.1').factory('Game',function ($resource) {
			return $resource(
				onorUrl + "/client/v2/games/" + appConfig.gameKey
			);
		}).factory('Campaign',function ($resource) {
			return $resource(
				onorUrl + "/client/v2/campaigns"
			);
		}).factory('CampaignPrize',function ($resource) {
			return $resource(
				onorUrl + "/client/v2/campaignsavailable"
			);
		}).factory('Tournament',function ($resource) {
			return $resource(
				onorUrl + "/client/v1/tournament"
			);
		}).factory('Charity', function ($resource) {
			return $resource(
				onorUrl + "/client/v1/charities"
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
			    onorUrl + '/client/v1/prizecode/:campaignId',
			    {},
			    {
			    	available: {
			    		method: 'GET'
			    	}
			    }
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
		}).factory('Facebook', function ($facebook) {
			return ;
		});

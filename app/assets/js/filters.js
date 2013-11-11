/*global define */

'use strict';

define(['angular'], function (angular) {

	/* Filters */

	angular.module('myApp.filters', []).
		filter('finfo', function() {
			return function (fuser) {
				var avatar = "img/ingame/player-pic-holder.png";
				if (!fuser.picture.data.is_silhouette) {
					avatar = fuser.picture.data.url;
				}
				return {
					id:fuser.id,
					avatar:avatar,
					name:fuser.name
				};
			}
		});

});
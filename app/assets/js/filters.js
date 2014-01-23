/*global define */

'use strict';


	/* Filters */

	angular.module('myApp.filters', []).
		filter('finfo', function() {
			return function (fuser) {
				var avatar = "../images/player-pic-holder.png";
				if (!fuser.picture.data.is_silhouette) {
					avatar = fuser.picture.data.url;
				}
				return {
					id:fuser.id,
					avatar:avatar,
					name:fuser.name,
					email:fuser.email
				};
			}
		}).
		filter('avatar', function() {
			return function(url) {
				//debugger;
				if (angular.isDefined(url)) {
					return url;
				} else {
					return "../images/player-pic-holder.png";
				}
			}
		}).filter('range', function() {
			  return function(input, total) {
				    total = parseInt(total);
				    for (var i=0; i<total; i++)
				      input.push(i);
				    return input;
				  };
				});;


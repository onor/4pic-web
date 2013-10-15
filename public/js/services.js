/*global define */

'use strict';

define(['angular'], function(angular) {

/* Services */

// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', ['ngResource']).
  value('version', '0.1').factory('Game', function($resource){
        return $resource(
            "./game"
        );
    }).factory('Campaign', function($resource){
        return $resource(
            "http://www.onor.net/client/v1/brands/5217421510d072b42ee36351/campaigns?page=1&perPage=10&userKey=4b1469e3ff90b438ef0134b1cb266c06"
        );
    }).factory('Score', function($resource){
        return $resource(
            "./scores/:fbid"
        );
    }).factory('State', function($resource){
        return $resource(
            "./states/:points:docController",{},
            {
                resolveLevel: { 
									method: 'PUT'
								},
                seenLevel: {
									params: {docController: "seen"}, 
									method: 'PUT'
								}
            }
        );
    });
});
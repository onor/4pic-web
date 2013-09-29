/*global define */

'use strict';

define(['angular'], function(angular) {

/* Services */

// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', ['ngResource']).
  value('version', '0.1').factory('Game', function($resource){
        return $resource(
            "http://www.onor.net/client/v1/games/4pics1word/:id?userKey=917428ade2027c3f3e28b6c9074bb695",
            {
                id: "@id"
            }
        );
    });
});
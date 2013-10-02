/*global define */

'use strict';

define(['angular'], function(angular) {

/* Directives */

angular.module('myApp.directives', []).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };

  }]).
  directive('timer',["$compile",function(a){return{restrict:"E",replace:!1,scope:{interval:"=interval",startTimeAttr:"=startTime",countdownattr:"=countdown",autoStart:"&autoStart"},controller:["$scope","$element","$attrs",function(b,c,d){function e(){b.timeoutId&&clearTimeout(b.timeoutId)}function f(){b.seconds=Math.floor(b.millis/1e3%60),b.minutes=Math.floor(b.millis/6e4%60),b.hours=Math.floor(b.millis/36e5%24),b.days=Math.floor(b.millis/36e5/24)}b.autoStart=d.autoStart||d.autostart,0===c.html().trim().length&&c.append(a("<span>{{millis}}</span>")(b)),b.startTime=null,b.timeoutId=null,b.countdown=b.countdownattr&&parseInt(b.countdownattr,10)>=0?parseInt(b.countdownattr,10):void 0,b.isRunning=!1,b.$on("timer-start",function(){b.start()}),b.$on("timer-resume",function(){b.resume()}),b.$on("timer-stop",function(){b.stop()}),b.start=c[0].start=function(){b.startTime=b.startTimeAttr?new Date(b.startTimeAttr):new Date,b.countdown=b.countdownattr&&parseInt(b.countdownattr,10)>0?parseInt(b.countdownattr,10):void 0,e(),g()},b.resume=c[0].resume=function(){e(),b.countdownattr&&(b.countdown+=1),b.startTime=new Date-(b.stoppedTime-b.startTime),g()},b.stop=b.pause=c[0].stop=c[0].pause=function(){b.stoppedTime=new Date,e(),b.$emit("timer-stopped",{millis:b.millis,seconds:b.seconds,minutes:b.minutes,hours:b.hours,days:b.days}),b.timeoutId=null},c.bind("$destroy",function(){e()}),b.millis=b.countdownattr?1e3*b.countdownattr:0,f();var g=function(){b.millis=new Date-b.startTime;var a=b.millis%1e3;if(b.countdownattr&&(b.millis=1e3*b.countdown),f(),b.countdown>0)b.countdown--;else if(b.countdown<=0)return b.stop(),void 0;b.timeoutId=setTimeout(function(){g(),b.$apply()},b.interval-a),b.$emit("timer-tick",{timeoutId:b.timeoutId,millis:b.millis})};(void 0===b.autoStart||b.autoStart===!0)&&b.start()}]}}]);;

});
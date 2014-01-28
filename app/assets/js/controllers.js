'use strict';


	function isMobile(){
	    var isMobile = (/iphone|ipod|android|ie|blackberry|fennec/).test
	         (navigator.userAgent.toLowerCase());
	    return isMobile;
	}

  var SplashCtrl = function($scope, $rootScope, State, $location, Game, $facebook, Charity, Campaign, $filter) {
	$rootScope.splashLoaded = true;
	
	$scope.goEnabled = false;
	
    $rootScope.game = Game.get({}, function(){
        $rootScope.charities = Charity.query({}, function(charities) {
        	$rootScope.charities = charities;//todo in conflict with 20 charities per query
        	$facebook.getLoginStatus().then(function(res) {
            	if(res.status == "connected") {
            		setState(res);
            	} else {
            		$scope.fbLoggedIn = false;
            	}
            	$scope.goEnabled = true;
            });
        });   	
    });

    $scope.campaigns = Campaign.query({});

    $scope.showGivePanel = false;
    $scope.showGetPanel = false;

    $scope.showTheGivePanel = function($event) {
      $scope.showGivePanel = true;
    };
    $scope.hideTheGivePanel = function($event) {
      $scope.showGivePanel = false;
    };
    $scope.showTheGetPanel = function() {
      $scope.showGetPanel = true;
    };
    $scope.hideTheGetPanel = function() {
      $scope.showGetPanel = false;
    };

    function setState(res, goFun){
    	$facebook.api('/me?fields=id,name,first_name,picture,email').then(function (me) {
        	appConfig.fbid = res.authResponse.userID;
        	$rootScope.me = $filter('finfo')(me);
    		State.get({fbid:appConfig.fbid}, function(res2){
    			$rootScope.state = res2;
    			if(angular.isDefined($rootScope.state.charityId)) {
    				$rootScope.pickedCharity = _.find($rootScope.charities, function(charity) {
    					return charity._id == $rootScope.state.charityId
    				});
    			}
    			var levelPack = $rootScope.state.state.levelPack;
    	    	$scope.fbLoggedIn = true;
    	    	if(angular.isDefined(goFun)) {
        			goFun();
        		}
    		});
        });
    }

    function goIfLoggedin(){
		if(angular.isDefined($rootScope.state.charityId)) {
			$location.path('/heart');
		} else {
			$location.path('/charity');
		}
	}

    $scope.go = function () {
    	if (!$scope.fbLoggedIn) {
    		var opts = null;
        	if (isMobile()) {
        		opts = {display:'touch', scope: 'email,publish_actions'};
        	} else {
        		opts = {scope: 'email,publish_actions'};
        	}

        	$facebook.login(opts).then(function(res) {
        		setState(res, goIfLoggedin);
        	});
    	} else {
    		goIfLoggedin();
    	}
    };

}

  var LeaderboardCtrl = function($scope, $rootScope, $location, $facebook, Score, $filter, Tournament, Votes) {
	  
	if(!$rootScope.splashLoaded) {
      $location.path('/');
    }  
	
	$scope.share = function() {
		var url = 'https://' + appConfig.baseUrl + '/' + appConfig.gameKey + '/charity/' + $rootScope.state.charityId + '?fbid=' + $rootScope.me.id + '&firstname=' + $rootScope.me.name + '&noOfVotes=' + ($scope.votes.heartSize - $scope.votes.needed) + '&donation=' + ($scope.votes.donationPer * $scope.votes.heartSize);
		$facebook.ui({method: 'feed',
			link: url,
			message: 'My Great Request'
		}).then(function() {});  ///:gameKey/charity/:charityId
		/*
		var url = "https://" + appConfig.baseUrl + '/' + appConfig.gameKey + '/charity/' + $rootScope.state.charityId + '?fbid=' + $rootScope.me.id;
		$facebook.api(['me/objects/fourpicbeauty-dev:charity','post', 
			{  object: {
				app_id: 304111289726859,
				url: url,
				title: "Sample Charity",
				image: "https://s3.amazonaws.com/onorassets.onor.net/522ccb2f490122bc02eb0929/9a2302fe-9fcd-446f-bc7b-485e1ce65d2a.png",
				description: ""
			}
			}
		]).then(function(res) {
		$facebook.api(['me/fourpicbeauty-dev:onored','post',{charity: url}]).then(
			function(response) {
				// handle the response
			}, function(err) {
				console.log("code " + err.error.code + " message " + err.error.message + " type " + err.error.type);
			}
		);
		}, function(err) {
			console.log("code " + err.error.code + " message " + err.error.message + " type " + err.error.type);
		});*/
	}
	  
	$scope.currentTab = "friends-tab";

	$scope.onClickTab = function (tab) {
	  $scope.currentTab = tab;
	}

	$scope.isActiveTab = function(tab) {
	  return tab == $scope.currentTab;
	}

    function calculateTimeUnits() {
        $scope.seconds = Math.floor(($scope.millis / 1000) % 60);
        $scope.minutes = Math.floor((($scope.millis / (60000)) % 60));
        $scope.hours = Math.floor((($scope.millis / (3600000)) % 24));
        $scope.days = Math.floor((($scope.millis / (3600000)) / 24));
    }
    
    var timer = null;    	
    $scope.$on("$destroy", function() {
    	clearTimeout(timer);
    });
   
    Tournament.get({}, function(tournament) {
    	$scope.tournament = tournament;
    	$scope.millis = tournament.week.end - new Date().getTime();
    	
    	function tick() {   
    	  calculateTimeUnits();
    	  
    	  timer = setTimeout(function () {
    	    tick();
    	    $scope.$digest();
    	  }, 1000);
    	  
    	  $scope.millis = $scope.millis - 1000;
    	}
    	tick();
    	
    });
    
      //retrieves all facebook friends that use the same app/game.
      //and for every retrieved facebook user, calls score service(by fbid) to fetch his current score.
    $facebook.api({
      method: 'fql.query',
      query: 'SELECT uid, name, is_app_user, pic_square FROM user WHERE (uid IN (SELECT uid2 FROM friend WHERE uid1 = me()) AND is_app_user = 1) or uid = me()'
    }).then(function (friends) {
      console.log(arguments);
      $scope.scores = [];
      _.map(friends, function (friend) {
        Score.get({fbid: friend.uid, weekly: false}, function (res) {
          friend.rank = res.rank;
          friend.score = res.score;
          friend.hearts = res.hearts;
          $scope.scores.push(friend);
        });
      });
    });

      //fetches weekly leaderboard. and for every retrieved score(with facebook id), it additionaly fetches facebook info.
    Score.query({weekly: true}, function (scores) {
      $scope.weeklyScores = [];
      _.map(scores, function (score) {
        $facebook.api('/' + score.playerId.id + '?fields=id,name,picture').then(
          function (response) {
            $scope.weeklyScores.push({
            	user: response, 
            	score: score.score, 
            	rank: score.rank, 
            	hearts: score.hearts,
            	prizes: score.prizes});
          },
          function (response) {
            alert('error');
          }
        );
      });
    });
    
    Score.query({weekly: false}, function (scores) {
        $scope.alltimeScores = [];
        _.map(scores, function (score) {
          $facebook.api('/' + score.playerId.id + '?fields=id,name,picture').then(
            function (response) {
              $scope.alltimeScores.push({
            	  user: response, 
            	  score: score.score, 
            	  rank: score.rank, 
            	  hearts: score.hearts,
            	  prizes: score.prizes});
            },
            function (response) {
              alert('error');
            }
          );
        });
      });

    var levelPack = $rootScope.state.state.levelPack;

      //navigation
    $scope.playAgain = function () {
      $location.path('/level');
    };
      
	  var matrix=[    [0,1,1,1,1,0,0,0,0,1,1,1,1,0],
	                  [1,1,1,1,1,1,1,1,1,1,1,1,1,1],	//6
	              	  [1,1,1,1,1,1,1,1,1,1,1,1,1,1],	//8
	  			      [1,1,1,1,1,1,1,1,1,1,1,1,1,1],	//10
	  			      [1,1,1,1,1,1,1,1,1,1,1,1,1,1],	//8
	  			      [1,1,1,1,1,1,1,1,1,1,1,1,1,1],	//6
	  			      [1,1,1,1,1,1,1,1,1,1,1,1,1,1],	//6
	  			      [0,1,1,1,1,1,1,1,1,1,1,1,1,0],	//4
	  			      [0,1,1,1,1,1,1,1,1,1,1,1,1,0],    //2
	  			      [0,0,1,1,1,1,1,1,1,1,1,1,0,0],
	  			      [0,0,0,1,1,1,1,1,1,1,1,0,0,0],
	  			      [0,0,0,0,1,1,1,1,1,1,0,0,0,0],
	  			      [0,0,0,0,0,1,1,1,1,0,0,0,0,0],
	  			      [0,0,0,0,0,0,1,1,0,0,0,0,0,0]]
	  
	  
	  $scope.votes = Votes.get({charityId:$rootScope.state.charityId}, function(votes) {
		  var reversed = votes.playerProfiles.reverse();
		  for (var i = matrix.length - 1; i >=0; i--) {
			for (var j = 0; j < matrix[i].length; j++) {
			  if (matrix[i][j] == 1 && reversed.length > 0) {
			    matrix[i][j] = reversed[reversed.length - 1];
			    reversed.splice(reversed.length - 1, 1);
			  } else {
				matrix[i][j] = parseInt(Math.random() * 10, 10) / 10;
			  }
			}
		  }
		  $scope.playerProfiles = matrix;
		  $scope.range = _.range(0, 14);
		  $scope.votes = votes;
	  }); 
	  
	  
	  $scope.profile = function(row,col) {
			 if($scope.playerProfiles != null && !_.isObject($scope.playerProfiles[row][col])) {
				 return "http://sinclaire.ca/clients/onor-app/placeholder.jpg";
			 } else {
				 return $scope.playerProfiles[row][col].picture.data.url;
			 }
		  }
		  
		  $scope.opacity = function(row,col) {
			 if($scope.playerProfiles != null && !_.isObject($scope.playerProfiles[row][col])) {
			   return "opacity:" + $scope.playerProfiles[row][col];
			 } else {
			   return "";
		     } 
		  }
    
    
    

  };

  var PrizeCtrl = function($scope, $rootScope, $location, CampaignPrize, $facebook, $filter, PrizeCode, Score, screenSize, Votes) {

	if(!$rootScope.splashLoaded) {
	  $location.path('/');
	}
		  
	$scope.seeLeaderboard = function() {
		$location.path('/leaderboard');	
	} 
	
	$scope.keepPlaying = function() {
		$location.path('/level');	
	}
	
	$scope.whenLoaded = function() {
		$(document).foundation({
			'orbit':{
		      animation: 'slide',
		      pause_on_hover: true,
		      stack_on_small: false,
		      navigation_arrows: true,
		      bullets: true,
		      next_on_click: true,
		      swipe: true,
		      slide_number: false,
		      timer: false
		    }, 
		    'reveal':{}});
		setTimeout(function(){
		  $(window).trigger('resize');        
	    }, 0);
	}
	  
	$scope.votes = Votes.get({charityId:$rootScope.state.charityId}, function(votes) {
		$scope.votes = votes;
	});
	
	  
    $scope.showTimer = false;
	$scope.progress =  100;
	$scope.progressFull = true;

    $scope.alltime = Score.get({fbid: $rootScope.me.id, weekly: false});
    Score.get({fbid: $rootScope.me.id, weekly: true}, function (res) {
		$scope.weekly = res;
	});
     
    $scope.score = $rootScope.state.state.lpScores[$rootScope.state.state.lpScores.length - 2].score;
	$scope.prizeUrl = 'prizes.html?points=' + $scope.score;


    //retrieves all campaigns, checks if user can take the prize. and enables/disables gui accordingly.
    CampaignPrize.query(function (res) {
      res = _.sortBy(res, function(camp) {
        return camp.prize.points;  
      });
      $scope.campaigns = _.map(res, function (camp) {
        camp.available = true;
        if (angular.isDefined(camp.prize.points)) {
          camp.available = $scope.score >= (camp.prize.points);
        }
        return camp;
      });
      
    });
    
    $scope.phoneNumberPattern = /^\(?(\d{3})\)?[ .-]?(\d{3})[ .-]?(\d{4})$/;
    
    function isEmpty(str) { return (str == null || str == '')};
    
    $scope.oneIsRequiredValid = function(){
      return !isEmpty($scope.rewardPost.email) || !isEmpty($scope.rewardPost.phoneNumber);
    };
    
	$scope.reedem = false;
    $scope.openModal = function(id) {
    	$scope.reedem = true;
    	$scope.reward = {
    	  image:$('#image-' + id).prop('src'),
    	  title:$('#title-' + id).text(),
    	  description:$('#description-' + id).text()
    	}

    	$scope.rewardPost = {
    	  email: $rootScope.me.email,
    	  campaignId: id,
    	  name: $rootScope.me.name,
    	  phoneNumber: "",
        charity: $rootScope.pickedCharity.name,
        votesneeded: $scope.votes.needed
    	}
    }

    $scope.submitted = false;
    $scope.sendReward = function(campaignId) {      
    	$scope.submitted = true;
   
    	if($scope.myForm.$valid && $scope.oneIsRequiredValid()) {
            PrizeCode.save({'fbid':appConfig.fbid}, $scope.rewardPost,
              function(success) {
            	$location.path('/leaderboard');
              },
              function(error) {alert('Error ' + error.data);}
            );
    	} else {
      
    		$scope.submitted = true;
    	}
    	
    };

  };

  var HeartCtrl = function($scope, $rootScope, Votes, $location, $timeout) {
	  
	  var matrix=[    [0,1,1,1,1,0,0,0,0,1,1,1,1,0],
	                  [1,1,1,1,1,1,1,1,1,1,1,1,1,1],	//6
	              	  [1,1,1,1,1,1,1,1,1,1,1,1,1,1],	//8
	  			      [1,1,1,1,1,1,1,1,1,1,1,1,1,1],	//10
	  			      [1,1,1,1,1,1,1,1,1,1,1,1,1,1],	//8
	  			      [1,1,1,1,1,1,1,1,1,1,1,1,1,1],	//6
	  			      [1,1,1,1,1,1,1,1,1,1,1,1,1,1],	//6
	  			      [0,1,1,1,1,1,1,1,1,1,1,1,1,0],	//4
	  			      [0,1,1,1,1,1,1,1,1,1,1,1,1,0],    //2
	  			      [0,0,1,1,1,1,1,1,1,1,1,1,0,0],
	  			      [0,0,0,1,1,1,1,1,1,1,1,0,0,0],
	  			      [0,0,0,0,1,1,1,1,1,1,0,0,0,0],
	  			      [0,0,0,0,0,1,1,1,1,0,0,0,0,0],
	  			      [0,0,0,0,0,0,1,1,0,0,0,0,0,0]]
	  
	  
	  if(!$rootScope.splashLoaded) {
	      $location.path('/');
	  } else {
		  $scope.votes = Votes.get({charityId:$rootScope.state.charityId}, function(votes) {
			  var reversed = votes.playerProfiles.reverse();
			  for (var i = matrix.length - 1; i >=0; i--) {
				for (var j = 0; j < matrix[i].length; j++) {
				  if (matrix[i][j] == 1 && reversed.length > 0) {
				    matrix[i][j] = reversed[reversed.length - 1];
				    reversed.splice(reversed.length - 1, 1);
				  } else {
					matrix[i][j] = parseInt(Math.random() * 10, 10) / 10;
				  }
				}
			  }
			  $scope.playerProfiles = matrix;
			  $scope.range = _.range(0, 14);
		  }); 
	  }
	  
	  $scope.profile = function(row,col) {
		 if($scope.playerProfiles != null && !_.isObject($scope.playerProfiles[row][col])) {
			 return "http://sinclaire.ca/clients/onor-app/placeholder.jpg";
		 } else {
			 return $scope.playerProfiles[row][col].picture.data.url;
		 }
	  }
	  
	  $scope.opacity = function(row,col) {
		 if($scope.playerProfiles != null && !_.isObject($scope.playerProfiles[row][col])) {
		   return "opacity:" + $scope.playerProfiles[row][col];
		 } else {
		   return "";
	     } 
	  }
	  
	  $scope.timer = $timeout(function(){
	     $location.path('/level');
	  }, 8000);
	  
	  $scope.$on("$destroy", function() {
		  $timeout.cancel($scope.timer)
	  });
  }

  var CharityCtrl = function($scope, $rootScope, Charity, $facebook, $filter, $location, Votes, screenSize, Heart) {
	  
	if(!$rootScope.splashLoaded) {
	  $location.path('/');
	}
	
	$scope.whenLoaded = function() {
		$(document).foundation({
			'orbit':{
		      animation: 'slide',
		      pause_on_hover: true,
		      stack_on_small: false,
		      navigation_arrows: true,
		      bullets: true,
		      next_on_click: true,
		      swipe: true,
		      slide_number: false,
		      timer: false
		    }, 
		    'reveal':{}});
		setTimeout(function(){
		  $(window).trigger('resize');        
	    }, 0);
	}
	  
    $scope.selectCharity = function(id) {
      $rootScope.state.charityId = id;
      $rootScope.pickedCharity = _.find($rootScope.charities, function(charity) {return charity._id == id;});
  	  
      $facebook.api('/me/picture?redirect=0&type=normal').then(function (picture) {
      Heart.save({
    	  fbid:$rootScope.me.id, 
    	  profileUrl:picture.data.url,
    	  gameUrl: $rootScope.game.design.logo, // todo unsafe adding of http
    	  gameKey: $rootScope.game.gameKey,
    	  charityUrl:$rootScope.pickedCharity.charity.logoColor,
    	  charityId:$rootScope.state.charityId,
    	  title: $rootScope.me.name + ', you rock!'
    	},{}, 
    	function(){console.log('ok')}, 
    	function(){console.log('not ok')}
      );
      });
      
	  $location.path('/heart');
    }

  };

var LevelCtrl = function($scope, $rootScope, State, $location, $facebook, $filter, $route, Score, $timeout) {

	if(!$rootScope.splashLoaded) {
	  $location.path('/');
	}
	
	$timeout(function() {$scope.hideToastr = true;}, 6000);
	
	$scope.showTimer = true;

	function callback(response) {
		if(response.to.length > 0) {
			removeLetters();
		}
	}

	$scope.inviteFriend = function() {
		$facebook.ui({method: 'apprequests',
			  message: 'My Great Request'
		}).then(callback);
	}

	Score.get({fbid: $rootScope.me.id, weekly: true}, function (res) {
		$scope.weekly = res;
	});

      //when all four levelimages are loaded, timer is started
    $scope.loadedImages = [];

    $scope.$on('levelimageloaded', function () {
      console.log("image load event received");
      $scope.loadedImages.push(true);
      if ($scope.loadedImages.length == 4) {
        console.log("starting timer");
        $scope.$broadcast('timer-start');
      }
    });

    //load logged user info

    if($rootScope.state.state.levelPack > $rootScope.game.levelPacks.length) {
        var levelPack = parseInt(Math.random() * $rootScope.game.levelPacks.length, 10);
    } else {        
    	var levelPack = $rootScope.state.state.levelPack;
    }
    var level = $rootScope.state.state.level;
    
	 //if user has already seen this question timer starts and ends from 1 second
    if ($rootScope.state.state.seen) {
        $scope.countdownAvailable = 1;
    } else {
        $scope.countdownAvailable = 30;
    }
    $rootScope.state.$seenLevel({}, function () {});

    $scope.away = $rootScope.game.levelPacks[levelPack].levels.length - $rootScope.state.state.level;
	$scope.progress =  ($rootScope.state.state.level / $rootScope.game.levelPacks[levelPack].levels.length) * 100;
	$scope.progressFull = false;
    
	$scope.score = $rootScope.state.state.lpScores[$rootScope.state.state.lpScores.length - 1].score;
    $rootScope.$watch('state', function (newValue) {
    	$scope.score = newValue.state.lpScores[$rootScope.state.state.lpScores.length - 1].score
    }, true);

    //navigation
    $scope.prizeList = function () {
      $location.path('/prize');
    };
    $scope.goToCharity = function () {
      $location.path('/charity');
    };

    //generates random string of additional letters of specified length, from array of chars
    function randomString(length, chars) {
      var result = '';
      for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
      return result;
    }

    //based on game definition, fills answer and pics.
    //todo: refactor to not take whole game definition

    $scope.level = $rootScope.game.levelPacks[levelPack].levels[level];

    function setLetters() {
    	$scope.answer = [];

    	for (var i = 0; i < $scope.level.answer.length; i++) {
    		$scope.answer.push('');
    	}

        //generates missing letters
        $scope.generated = randomString((12 - $scope.level.answer.length), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');

        //shuffle answer with additional letters
        $scope.other = _.shuffle(($scope.level.answer.toUpperCase() + $scope.generated).split(''));    	
    }
    
    setLetters();
    
    //logic to check if answer is correct one
    //css is changed based on 'scope.correct' model
    $scope.invalid = false;
    $scope.$watch('answer', function (newValue) {
      $scope.invalid = false;

      $scope.correct = $scope.level.answer.toUpperCase() == newValue.join('');
      if ($scope.correct) {
        $scope.$broadcast('timer-stop');
        var points2 = 10;
        if(angular.isDefined($scope.remains)) {
        	points2 = $scope.remains * 10;
        }
        $rootScope.state.$resolveLevel({points: points2}, function () {
          $scope.nextLevel();
        });
      }

      if ($scope.level.answer.length == newValue.join('').length && !$scope.correct) {
        $scope.invalid = true;
      }
    }, true);

    //adds letter to answer
    $scope.add = function (index) {
    	
      if($scope.invalid) return;

      var item = $scope.other[index];
      $scope.other[index] = '';

      for (var i = 0; i < $scope.answer.length; i++) {
        if ($scope.answer[i] == '') {
          $scope.answer[i] = item;
          break;
        }
      }
    };

    //remove letter from answer
    //todo: add check for 12 length
    $scope.remove = function (index) {
      var item = $scope.answer[index];
      $scope.answer[index] = '';

		for (var i = 0; i < $scope.other.length; i++) {
			if ($scope.other[i] == '') {
				$scope.other[i] = item;
				break;
			}
		}
	}

	function removeLetter(letter, array) {
		for(var i = 0; i < array.length; i++) {
		  if(array[i] == letter) {
		  	array[i] = '';
				return true;
		  }
		}
		return false;
	}

	function removeLetters() {
		for (var i = 0; i < $scope.generated.length; i++) {
			var letter = $scope.generated[i];
			var removedFromOther = removeLetter(letter, $scope.other);
			if (!removedFromOther) {
				removeLetter(letter, $scope.answer);
			}
		}
	}
	
	$scope.revealLetter = function () {
		var answer = $scope.level.answer.toUpperCase();
		var letter = _.first(_.shuffle(_.intersection(answer.split(''), $scope.other)));
		var index = _.indexOf($scope.other, letter);
		if (index > -1) {
			for (var i = 0; i < answer.length; i++) {
				if ($scope.answer[i] != answer[i] && answer[i] == letter) {
					$scope.answer[i] = letter;
					$scope.other[index] = '';
					break;
				}
			}
		}
	}
	
	$scope.revertLetters = function() {
		setLetters();
	}

	$scope.hintUsed = false;
	$scope.hint = function() {
		//User has selected Question Mark
		if ($scope.hintUsed == false) {
			$rootScope.state.$hint({hint: 10}, function (res) {
				$scope.revealLetter();
				$scope.revealLetter();
				$scope.revealLetter();

				$scope.hintUsed = true;
			});
		}
	}
	
	$scope.skip = function() {
		$rootScope.state.$resolveLevel({points: 0}, function () {
			$scope.nextLevel();
	    });
	}

	$scope.levels = $rootScope.game.levelPacks[levelPack].levels;

	$scope.nextLevel = function () {

		if (level == $scope.levels.length - 1) { //todo take 4 from game definition, remove levelPack param
			$location.path('/prize');
		} else {
			$route.reload();
		}

	}

	$scope.showSkip = false;//todo refresh controller
  //timer text info refresh
	$scope.$on('timer-tick', function (event, data) {
		$scope.remains = data.millis / 1000;
		if($scope.remains < 2) {
			$scope.showSkip = true;
		}
	});
}


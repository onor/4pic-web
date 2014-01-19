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
        $scope.charities = Charity.query({}, function(charities) {
        	$scope.charities = charities;//todo in conflict with 20 charities per query
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
    	$facebook.api('/me?fields=id,name,picture,email').then(function (me) {
        	appConfig.fbid = res.authResponse.userID;
        	$rootScope.me = $filter('finfo')(me);
    		State.get({fbid:appConfig.fbid}, function(res2){
    			$rootScope.state = res2;
    			if(angular.isDefined($rootScope.state.charityId)) {
    				$rootScope.pickedCharity = _.find($scope.charities, function(charity) {
    					return charity._id == $rootScope.state.charityId
    				});
    			}
    			var levelPack = $rootScope.state.state.levelPack;
    			$scope.hasMoreLevelPacks = $rootScope.game.levelPacks.length >= (levelPack + 1);
    	    	$scope.fbLoggedIn = true;
    	    	if(angular.isDefined(goFun)) {
        			goFun();
        		}
    		});
        });
    }

    function goIfLoggedin(){
    	if($scope.hasMoreLevelPacks) {
			if(angular.isDefined($rootScope.state.charityId)) {
			    $location.path('/heart');
			} else {
				$location.path('/charity');
			}
		} else {
			$location.path('/leaderboard');
		}
	}

    $scope.go = function () {
    	if (!$scope.fbLoggedIn) {
    		var opts = null;
        	if (isMobile()) {
        		opts = {display:'touch'};
        	} else {
        		opts = {};
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

	$scope.votes = Votes.get({charityId:$rootScope.state.charityId}, function(votes) {
	  $scope.votes = votes;
	});  
	  
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
    $scope.hasMoreLevelPacks = ($rootScope.game.levelPacks.length >= (levelPack + 1));

      //navigation
    $scope.playAgain = function () {
      $location.path('/level');
    };

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
		$(document).foundation('orbit', {});
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
     
    $scope.score = $rootScope.state.state.lpScores[$rootScope.state.state.lpScores.length - 1].score;
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

      //user can pick prize if he has enough points
    $scope.claimReward = function(campaign) {
      if (campaign.available) {
        PrizeCode.save({'fbid':appConfig.fbid},{
          'email' : 'piyush@onor.net',
          'campaignId' : campaign._id,
          'name' : $rootScope.me.name,
          'phoneNumber' : '+1 415 866 4194'
        },
          function(success) {alert('Prize was sent.');},
          function(error) {alert('Error ' + error.data);}
        );
      }
    };

  };

  var HeartCtrl = function($scope, $rootScope, Votes, $location, $timeout) {
	  
	  if(!$rootScope.splashLoaded) {
	      $location.path('/');
	  } else {
		  $scope.votes = Votes.get({charityId:$rootScope.state.charityId}, function(votes) {
		      $scope.playerProfiles = votes.playerProfiles.reverse();
		  }); 
	  }
	  
	  $scope.timer = $timeout(function(){
	      $location.path('/level');
	  }, 3000);
	  
	  $scope.$on("$destroy", function() {
		  $timeout.cancel($scope.timer)
	  });
  }

  var CharityCtrl = function($scope, $rootScope, Charity, $facebook, $filter, $location, Votes, screenSize) {
	  
	if(!$rootScope.splashLoaded) {
	  $location.path('/');
	}
	  
	$scope.charities = Charity.query({}, function(charities){
	  if (screenSize.is('small')) {
	    $scope.perPage = 1;
	  }
	  if (screenSize.is('medium')) {
		$scope.perPage = 2;
	  }
	  if (screenSize.is('large')) {
	    $scope.perPage = 3;
	  }
	  $scope.page = 0;
	  $scope.pageNo = charities.length / $scope.perPage;
	  $scope.charities = charities;
	});

    $scope.$watch('page', function (newValue) {
    	$scope.hasPrevious = newValue > 0;
        $scope.hasNext = newValue < $scope.pageNo - 1;
    });

    $scope.previous = function() {
      $scope.page = $scope.page - 1;
    };

    $scope.next = function() {
      $scope.page = $scope.page + 1;
    };

    $scope.selectCharity = function(charity) {
      $rootScope.state.charityId = charity._id;
      $rootScope.pickedCharity = charity;
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

    var levelPack = $rootScope.state.state.levelPack;
    var level = $rootScope.state.state.level;

    $scope.away = $rootScope.game.levelPacks[levelPack].levels.length - $rootScope.state.state.level;
	$scope.progress =  ($rootScope.state.state.level / $rootScope.game.levelPacks[levelPack].levels.length) * 100;
	$scope.progressFull = false;
    
	$scope.score = '00';
	if ($rootScope.state.state.level != 0) {
		$scope.score = $rootScope.state.state.lpScores[$rootScope.state.state.lpScores.length - 1].score;
	}


      //if user has already seen this question timer starts and ends from 1 second
    if ($rootScope.state.state.seen) {
      $scope.countdownAvailable = 30;
    } else {
      $scope.countdownAvailable = 30;
    }

      //todo move this to occur after all images are loaded
    $rootScope.state.$seenLevel({}, function () {
    });

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
        var points2 = $scope.remains * 10;
        $rootScope.state.$resolveLevel({points: points2}, function () {
          $scope.nextLevel(points2);
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
				$scope.hintUsed = true;
			});
		}
	}

	$scope.levels = $rootScope.game.levelPacks[levelPack].levels;

	$scope.nextLevel = function (points2) {

		if (level == $scope.levels.length - 1) { //todo take 4 from game definition, remove levelPack param
			$location.path('/prize');
		} else {
			$route.reload();
		}

	}

  //timer text info refresh
	$scope.$on('timer-tick', function (event, data) {
		$scope.remains = data.millis / 1000;
	});
}


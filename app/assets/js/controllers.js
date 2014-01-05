'use strict';

define(['angular'], function (angular) {
	
	function isMobile(){
	    var isMobile = (/iphone|ipod|android|ie|blackberry|fennec/).test
	         (navigator.userAgent.toLowerCase());
	    return isMobile;
	}

  var SplashCtrl = function($scope, $rootScope, State, $location, $modal, Game, $facebook, Charity, Campaign, $filter) {
      //todo: refactor so that game def is loaded only once.
      //todo: refactor all facebook stuff out into a seperate service.
    $rootScope.game = Game.get({}, function(){});
    
    $scope.charities = Charity.query({});
    $scope.campaigns = Campaign.query({});

    $scope.friendsWhoHavePlayed = [];
    $facebook.getLoginStatus().then(function(res) {
    	$scope.fbLoggedIn = res.status == "connected";
    });
    $scope.showGivePanel = false;
    $scope.showGetPanel = false;

    $scope.toggleGivePanel = function() {
      $scope.showGivePanel = !$scope.showGivePanel;
    };
    $scope.toggleGetPanel = function() {
      $scope.showGetPanel = !$scope.showGetPanel;
    };
    
    function goIfLogedin(res){
    	    	
        $facebook.api('/me?fields=id,name,picture,email').then(function (me) {
        	$rootScope.me = $filter('finfo')(me);
        	
        	appConfig.fbid = res.authResponse.userID;
    		State.get({fbid:appConfig.fbid}, function(res){
    			$rootScope.state = res;
    			var levelPack = $rootScope.state.state.levelPack;
    			var hasMoreLevelPacks = $rootScope.game.levelPacks.length >= (levelPack + 1);
    			if(hasMoreLevelPacks) {
    				if(angular.isDefined($rootScope.state.charityId)) {
    					$location.path('/level');
    				} else {
    					$location.path('/charity');
    				}
    			} else {
    				alert('todo');
    			}
    		});
        });
    	
		
	}

    $scope.go = function () {
    	if (!$scope.fbLoggedIn) {
    		var opts = null;
        	if (isMobile()) {
        		opts = {display:'touch'};
        	} else {
        		opts = {};
        	}
        	$facebook.login(opts).then(goIfLogedin);
    	} else {
    		$facebook.getLoginStatus().then(goIfLogedin);
    	}
    };

}

  var LeaderboardCtrl = function($scope, $rootScope, $location, $facebook,$modal, Score, $filter, Tournament) {
	  
	$scope.currentTab = "friends-tab";  
	  
	$scope.onClickTab = function (tab) {
	  $scope.currentTab = tab;
	}
	    
	$scope.isActiveTab = function(tab) {
	  return tab == $scope.currentTab;
	}
    
    $scope.fromnow = moment().endOf('week').fromNow();
    
    $scope.tournament = Tournament.get();

      //retrieves all facebook friends that use the same app/game.
      //and for every retrieved facebook user, calls score service(by fbid) to fetch his current score.
    $facebook.api({
      method: 'fql.query',
      query: 'SELECT uid, name, is_app_user, pic_square FROM user WHERE uid IN (SELECT uid2 FROM friend WHERE uid1 = me()) AND is_app_user = 1'
    }).then(function (friends) {
      console.log(arguments);
      $scope.scores = [];
      _.map(friends, function (friend) {
        Score.get({fbid: friend.uid, weekly: false}, function (res) {
          friend.rank = res.rank;
          friend.score = res.score;
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
            $scope.weeklyScores.push({user: response, score: score.score, rank: score.rank});
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
    $scope.getPrize = function () {
      $location.path('/prize');
    };
  };

  var PrizeCtrl = function($scope, $rootScope, $modal, $location, Campaign, $facebook, $filter, PrizeCode, Score) {

    $scope.alltime = Score.get({fbid: $rootScope.me.id, weekly: false});

    //retrieves all campaigns, checks if user can take the prize. and enables/disables gui accordingly.
    Campaign.query(function (res) {
      //$scope.campaigns = _.groupBy(res, function(a){ return Math.floor(_.indexOf(res,a)/1)});
      $scope.campaigns = _.map(res, function (camp) {
        PrizeCode.available({campaignId:camp._id}, function(cnt) {
          camp.available = true;
          if (angular.isDefined(camp.prize.points)) {
            camp.available = ($rootScope.state.state.lpScores[$rootScope.state.state.lpScores.length - 1].score - 0) >= (camp.prize.points);
          }
        });
        camp.picked = false;
        return camp;
      });
      $scope.hasAvailable = _.some($scope.campaigns, function(campaign) {
        return campaign.available;
      });
    });

      //watches selectcampaign model, and changes picked state in campaigns collection based on it
    $scope.selectedCampaign = null;
    $scope.$watch('selectedCampaign', function (selected) {
      _.each($scope.campaigns, function(campaign) {
        campaign.picked = selected._id === campaign._id;
      });
    }, true);

      //user can pick prize if he has enough points
    $scope.pickPrize = function(campaign) {
      if (campaign.available) {
        $scope.selectedCampaign = campaign;
        PrizeCode.save({'fbid':appConfig.fbid},{
          'email' : 'rudolf.markulin@gmail.com',
          'campaignId' : campaign._id,
          'name' : $rootScope.me.name,
          'phoneNumber' : '+1 650-272-9246'
        },
          function(success) {alert('Prize was sent.');},
          function(error) {alert('Error ' + error);}
        );
      } else {
        $scope.openModal();
      }
    };

      //navigation
    $scope.charity = function () {
      $location.path('/charity');
    };
    
    $scope.openModal = function() {
      var modalInstance = $modal.open({
        templateUrl: '../../partials/prizeModal.html',
        backdrop:false,
        controller: PrizeModalCtrl,
        resolve: {
          points: function () {return true;}
        }
      });

      modalInstance.result.then(function (res) {
        $location.path('/charity');
      });
    };

  };

  var PrizeModalCtrl = function($scope, $modalInstance) {
    $scope.close = function() {
      $modalInstance.close('');
    };
  };
  
  var HeartCtrl = function($scope, $rootScope, Votes) {
	  $scope.votes = Votes.get({}, function(votes) {
	      $scope.playerProfiles = votes.playerProfiles.reverse();
	  });  
  }

  var CharityCtrl = function($scope, $rootScope, Charity, $facebook, $filter, $location, $modal, Votes) {
    var carousel;

    $scope.hasPrevious = function() {
      return carousel ? carousel.hasPrevious() : false;
    };
    $scope.previous = function() {
      if (carousel) { carousel.prev(); }
    };
    $scope.hasNext = function() {
      return carousel ? carousel.hasNext() : false;
    };
    $scope.next = function() {
      if (carousel) { carousel.next(); }
    };

    var loadCharities = function(carouselScope, page) {
      carousel.updatePageCount(6);
      carouselScope.charities = Charity.query();
    };
    $scope.loadPage = function(page, tmplCb) {
      var newScope = $scope.$new();
      loadCharities(newScope, page);
      tmplCb(newScope);
    };
    $scope.onCarouselAvailable = function(car) {
      carousel = car;
    };
    
    $scope.selectCharity = function(charity) {
      $rootScope.state.charityId = charity._id;	
	  $location.path('/level');
    }

    $scope.aboutExpanded = [];
    $scope.charities = Charity.query({});
    
    //get lists of available charities to vote for
    $scope.charities = Charity.query();
    
    function addPlayer(matrix, prof) {
      for (var i = matrix.length - 1; i >=0; i--) {
        for (var j = 0; j < matrix[i].length; j++) {
          if (matrix[i][j] == 1) {
            matrix[i][j] = prof;
            return;
          }
        }
      }
    }
      
    var matrix = [[0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0],
                  [0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0],
                  [0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,0],
                  [1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1],
                  [1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1],
                  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
                  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
                  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
                  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
                  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
                  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
                  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
                  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
                  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
                  [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
                  [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
                  [0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0],
                  [0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0],
                  [0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],
                  [0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0],
                  [0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0],
                  [0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0],
                  [0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0],
                  [0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0],
                  [0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0],
                  [0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0],
                  [0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0]];
                  
    //retrieves data about last heart votes, filled heart, and remaining votes to fill heart
    $scope.votes = Votes.get({}, function(votes) {
      var reversed = votes.playerProfiles.reverse();
      for (var i = 0; i < reversed.length; i++) {
        addPlayer(matrix, reversed[i]);
      }
      $scope.playerProfiles = matrix;
    });
  };








var LevelCtrl = function($scope, $rootScope, $modal, State, $location, $facebook, $filter, $route, Score) {
	
	Score.get({fbid: $rootScope.me.id, weekly: true}, function (res) {
		$scope.weekly = res;
	});

      //when all four levelimages are loaded, timer is started
    $scope.loadedImages = [];
    $scope.$on('levelimageloaded', function () {
      $scope.loadedImages.push(true);
      if ($scope.loadedImages.length == 4) {
        $scope.$broadcast('timer-start');
      }
    });

    //load logged user info

    var levelPack = $rootScope.state.state.levelPack;
    var level = $rootScope.state.state.level;

	$scope.progress =  ($rootScope.state.state.level / $rootScope.game.levelPacks[levelPack].levels.length) * 100;
	$scope.progressFull = false;


      //if user has already seen this question timer starts and ends from 1 second
    if ($rootScope.state.state.seen) {
      $scope.countdownAvailable = 1;
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

    $scope.answer = [];

	for (var i = 0; i < 12; i++) {
		$scope.answer.push('');
	}

    //generates missing letters
    $scope.generated = randomString((12 - $scope.level.answer.length), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    $scope.showHint = $scope.generated.length > 0;

    //shuffle answer with additional letters
    $scope.other = _.shuffle(($scope.level.answer.toUpperCase() + $scope.generated).split(''));

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
	
	$scope.removeLetters = function () {
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

	//$scope.removeLettersEnabled = $rootScope.alltime >= 40;
	//$scope.revealLettersEnabled = $rootScope.alltime >= 10;
	
	$scope.hintUsed = false;
	$scope.hint = function() {
		//User has selected Question Mark
		if ($scope.hintUsed == false) {
			$rootScope.state.$hint({hint: 10}, function (res) {	
        debugger;				
				$scope.removeLetters();
				$scope.hintUsed = true;
			});
					
			//$rootScope.state.$hint({hint: 10}, function (res) {					
			//	$scope.revealLetter();
			//	$scope.hintUsed = true;
			//});
		}
	}
	
	$scope.levels = $rootScope.game.levelPacks[levelPack].levels;

	$scope.nextLevel = function (points2) {

		if (level == $scope.levels.length - 1) { //todo take 4 from game definition, remove levelPack param
			$location.path('/leaderboard');
		} else {
			$route.reload();
		}

	}

  //timer text info refresh
	$scope.$on('timer-tick', function (event, data) {
		$scope.remains = data.millis / 1000;
	});
}

return {
	HeartCtrl:HeartCtrl,
	SplashCtrl:SplashCtrl,
	LeaderboardCtrl:LeaderboardCtrl,
	CharityCtrl:CharityCtrl,
	LevelCtrl:LevelCtrl,
	PrizeCtrl:PrizeCtrl,
	PrizeModalCtrl:PrizeModalCtrl
}
});

'use strict';

define(['angular'], function (angular) {

var SplashCtrl = function($scope, $rootScope, State, $location, $modal, Game, $facebook) {

    //todo: refactor so that game def is loaded only once.
	$rootScope.game = Game.get({});

	$rootScope.state = State.get();

	$scope.go = function () {
		var levelPack = $rootScope.state.state.levelPack;
		var hasMoreLevelPacks = $rootScope.game.levelPacks.length >= (levelPack + 1);
		if(hasMoreLevelPacks) {
			$location.path('/level');
		} else {
		 		var modalInstance = $modal.open({
		 	 		templateUrl: '../../partials/noLevelModal.html',
		 	 		backdrop:false,
		 	 		controller: NoLevelModalCtrl,
					resolve: {}
		 	 	});
		}
	}

    //quick jump to leaderboard page from splash screen
	$scope.ld = function () {
		$location.path('/leaderboard');
	}

    //quick jump to prize page from splash screen
	$scope.prize = function () {
		$location.path('/prize');
	}
}

var LeaderboardCtrl = function($scope, $rootScope, $location, $facebook,$modal, Score, $filter) {
	
	$scope.fromnow = moment().endOf('week').fromNow();

    //load logged user info
	$facebook.api('/me?fields=id,name,picture').then(function (me) {$scope.me = $filter('finfo')(me);});

    //retrieves all facebook friends that use the same app/game.
    //and for every retrieved facebook user, calls score service(by fbid) to fetch his current score.
	$facebook.api({
		method: 'fql.query',
		query: 'SELECT uid, name, is_app_user, pic_square FROM user WHERE uid IN (SELECT uid2 FROM friend WHERE uid1 = me()) AND is_app_user = 1'
	}).then(function (friends) {
			$scope.scores = [];
			_.map(friends, function (friend) {
				Score.get({fbid: friend.uid, weekly: false}, function (res) {
					friend.score = res.value;				
					$scope.scores.push(friend);
				});
			});
		});

    //fetches weekly leaderboard. and for every retrieved score(with facebook id), it additionaly fetches facebook info.
	Score.query({weekly: true}, function (scores) {
		$scope.weeklyScores = [];
		_.map(scores, function (score) {
			$facebook.api('/' + score._id.playerId.id + '?fields=id,name,picture').then(
				function (response) {
					$scope.weeklyScores.push({user: response, score: score.value});
				},
				function (response) {
					alert('error');
				}
			);
		});
	});

    //navigation
	$scope.playAgain = function () {
		var levelPack = $rootScope.state.state.levelPack;
		var hasMoreLevelPacks = $rootScope.game.levelPacks.length >= (levelPack + 1);
		if(hasMoreLevelPacks) {
			$location.path('/level');
		} else {
		 		var modalInstance = $modal.open({
		 	 		templateUrl: '../../partials/noLevelModal.html',
		 	 		backdrop:false,
		 	 		controller: NoLevelModalCtrl,
					resolve: {}
		 	 	});
		}
	}
	$scope.getPrize = function () {
		$location.path('/prize')
	}
}

var NoLevelModalCtrl = function($scope, $modalInstance) {
  $scope.close = function() {
		$modalInstance.close("");
  }
}

var PrizeCtrl = function($scope, $rootScope, $modal, $location, Campaign, $facebook, $filter, PrizeCode) {

    //load logged user info
	$facebook.api('/me?fields=id,name,picture,email').then(function (me) {
		$scope.me = $filter('finfo')(me);
		$scope.me2 = me;
	});

    //sum off all scores on all level packs. todo: rename it after prize redemption integration
	$scope.alltime = $rootScope.state.scoreSummary.alltime;
	$scope.usedpoints = PrizeCode.get({});
	

	//retrieves all campaigns, checks if user can take the prize. and enables/disables gui accordingly.
	Campaign.query(function (res) {
		//$scope.campaigns = _.groupBy(res, function(a){ return Math.floor(_.indexOf(res,a)/1)});
		$scope.campaigns = _.map(res, function (camp) {
			PrizeCode.available({campaignId:camp._id}, function(cnt) {
				camp.available = ($scope.alltime - $scope.usedpoints.used) >= (camp.prize.retail * 1000);	
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
			campaign.picked = selected._id == campaign._id;
		});
	}, true);

    //user can pick prize if he has enough points
	$scope.pickPrize = function(campaign) {
		if (campaign.available) {
			$scope.selectedCampaign = campaign;
			PrizeCode.save({
				'email' : $scope.me2.email,
				'campaignId' : campaign._id,
				'name' : $scope.me2.name}, 
				function(success) {alert('Prize was sent to ' + $scope.me2.email);},
				function(error) {alert('Error ' + error);});
		} else {
			$scope.openModal();
		}
	}

    //navigation
	$scope.charity = function () {
		$location.path('/charity');
	}
	
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
	}

}

var PrizeModalCtrl = function($scope, $modalInstance) {
  $scope.close = function() {
		$modalInstance.close("");
  }
}

var CharityCtrl = function($scope, $rootScope, Charity, $facebook, $filter, $location, $modal, Votes) {
	
	//load logged user info
	$facebook.api('/me?fields=id,name,picture').then(function (me) {
		$scope.me = $filter('finfo')(me);
		$scope.meForVote = me;
	});
	
	//navigation
	$scope.playAgain = function () {
		var levelPack = $rootScope.state.state.levelPack;
		var hasMoreLevelPacks = $rootScope.game.levelPacks.length >= (levelPack + 1);
		if(hasMoreLevelPacks) {
			$location.path('/level');
		} else {
		 		var modalInstance = $modal.open({
		 	 		templateUrl: '../../partials/noLevelModal.html',
		 	 		backdrop:false,
		 	 		controller: NoLevelModalCtrl,
					resolve: {}
		 	 	});
		}
	}
	$scope.quit = function() {
		$location.path('/splash');
	}

	//todo: push to heart after successful post to backend
	//todo: maybe to move this to cloudsave? user could vote many times if he uses back button.
	//we can disable back button or track state if he has voted for lp.
	$scope.voted = false;
	$scope.vote = function(charity) {
		if($scope.voted == false) {
			Votes.save({charityId:charity._id}, function() {
				addPlayer($scope.playerProfiles, $scope.meForVote);				
				$scope.votes.needed = $scope.votes.needed - 1;
				$scope.voted = true;
			});
		}
	}

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
}

var LevelCtrl = function($scope, $rootScope, $modal, State, $location, $facebook, $filter, $route) {

    //when all four levelimages are loaded, timer is started
	$scope.loadedImages = [];
	$scope.$on('levelimageloaded', function () {
		$scope.loadedImages.push(true);
		if ($scope.loadedImages.length == 4) {
			$scope.$broadcast('timer-start');
		}
	});

	//load logged user info
	$facebook.api('/me?fields=id,name,picture').then(function (me) {$scope.me = $filter('finfo')(me);});

	var levelPack = $rootScope.state.state.levelPack;
	var level = $rootScope.state.state.level;

    //if user has already seen this question timer starts and ends from 1 second
	if ($rootScope.state.state.seen) {
		$scope.countdownAvailable = 1;
	} else {
		$scope.countdownAvailable = 30;
	}

    //todo move this to occur after all images are loaded
	$rootScope.state.$seenLevel({}, function (res) {
	});
	
  //navigation
	$scope.prizeList = function () {
		$location.path('/prize');
	}
	$scope.back = function () {
    $location.path("/splash");
  }

  //generates random string of additional letters of specified length, from array of chars
	function randomString(length, chars) {
		var result = '';
		for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
		return result;
	};

  //based on game definition, fills answer and pics.
  //todo: refactor to not take whole game definition

	$scope.level = $rootScope.game.levelPacks[levelPack].levels[level];

	$scope.answer = [];

	for (var i = 0; i < $scope.level.answer.length; i++) {
		$scope.answer.push('');
	}

  //generates missing letters
	$scope.generated = randomString((12 - $scope.level.answer.length), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');

  //shuffle answer with additional letters
	$scope.other = _.shuffle(($scope.level.answer.toUpperCase() + $scope.generated).split(''));

  //logic to check if answer is correct one
  //css is changed based on 'scope.correct' model
	$scope.invalid = false;
	$scope.$watch('answer', function (newValue) {
		$scope.invalid = false;

		$scope.correct = $scope.level.answer.toUpperCase() == newValue.join("");
		if ($scope.correct) {
			$scope.$broadcast('timer-stop');
			var points2 = $scope.remains * 10
			$rootScope.state.$resolveLevel({points: points2}, function (res) {
				$scope.nextLevel(points2);
			});
		}

		if ($scope.level.answer.length == newValue.join("").length && !$scope.correct) {
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
	}

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

	$scope.hintUsed = false;
	$scope.hint = function() {
		//User has selected Question Mark

		if ($scope.hintUsed == false) {

			var modalInstance = $modal.open({
				templateUrl: '../../partials/hint.html',
				controller: HintCtrl,
				backdrop:true				
				});

			modalInstance.result.then(function (msg) {
				if (msg == "revealLetters") {		
					$rootScope.state.$hint({hint: 10}, function (res) {					
						$scope.revealLetter();
						$scope.hintUsed = true;
					});
				}
				else if (msg == "removeLetters") {
					$rootScope.state.$hint({hint: 40}, function (res) {					
						$scope.removeLetters();
						$scope.hintUsed = true;
					});
				}

			});
		}
	}
	
	$scope.levels = $rootScope.game.levelPacks[levelPack].levels;

	$scope.nextLevel = function (points2) {

		if (level == $scope.levels.length - 1) { //todo take 4 from game definition, remove levelPack param
			$location.path('/leaderboard');
		} else {

			var modalInstance = $modal.open({
				templateUrl: '../../partials/nextlevel.html',
				controller: NextLevelCtrl,
				backdrop:true,
				resolve: {
					points: function () {
						return points2;
					}
				}
			});

			modalInstance.result.then(function (points) {
				if (points) {
					$route.reload();
				}
			});
		}

	}




  //timer text info refresh
	$scope.$on('timer-tick', function (event, data) {
		$scope.remains = data.millis / 1000;
	});
}

var HintCtrl = function($scope, $rootScope, $modalInstance) {
	$scope.removeLettersEnabled = $rootScope.alltime >= 40;
	$scope.revealLettersEnabled = $rootScope.alltime >= 10;
	
	$scope.removeLetters = function () {
		$modalInstance.close("removeLetters");
	}

	$scope.revealLetters = function () {
	   $modalInstance.close("revealLetters");
	}
	
	$scope.dismiss = function() {
		$modalInstance.dismiss();
	};


}

//navigates to next level
var NextLevelCtrl = function($scope, $modalInstance, points) {
	$scope.points = points;
	$scope.next = function () {
		$modalInstance.close(points);
	}

}


return {
	SplashCtrl:SplashCtrl,
	LeaderboardCtrl:LeaderboardCtrl,
	CharityCtrl:CharityCtrl,
	LevelCtrl:LevelCtrl,
	HintCtrl:HintCtrl,
	NoLevelModalCtrl:NoLevelModalCtrl,
	PrizeCtrl:PrizeCtrl,
	PrizeModalCtrl:PrizeModalCtrl,
	NextLevelCtrl:NextLevelCtrl
}
});

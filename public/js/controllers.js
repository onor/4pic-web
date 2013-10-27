'use strict';

//todo: remove flat-ui.css amd all related files?

function SplashCtrl($scope, $rootScope, State, $location, Game, $facebook) {

    //todo: check if needed
	$facebook.getLoginStatus();

    //todo: refactor so that game def is loaded only once.
	$scope.game = Game.get({}, function (game) {
		$scope.game = game;
	});

    //todo: can be removed if we get rid of levelpack and level parameters.
	$rootScope.state = State.get();

	$scope.go = function () {
		$location.path('/levelpack/' + $rootScope.state.state.levelPack + '/level/' + $rootScope.state.state.level);
	}

    //quick jump to leaderboard page from splash screen
	$scope.ld = function () {
		$location.path('/leaderboard/1');
	}

    //quick jump to prize page from splash screen
	$scope.prize = function () {
		$location.path('/prize');
	}
}

function LeaderboardCtrl($scope, $rootScope, $location, $facebook, Score, $filter) {

    //load logged user info
	$facebook.api('/me?fields=id,name,picture').then(function (me) {$scope.me = $filter('finfo')(me);});

	var levelPack = $rootScope.state.state.levelPack;

    //calculate best score as maximum of all scores on all level packs.
	$scope.bestScore = _.max($rootScope.state.state.lpScores,function (lps) {
		return lps.score;
	}).score;

    //return last finished levelpack score.
	var sc = $rootScope.state.state.lpScores[levelPack - 1];
	if (sc) {
		$scope.lpScore = sc.score;
	} else {
		$scope.lpScore = 0;
	}

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
		$location.path('/levelpack/' + (levelPack + 1) + '/level/' + 0); //todo remove url parameters
	}
	$scope.getPrize = function () {
		$location.path('/prize')
	}
}

function PrizeCtrl($scope, $rootScope, $modal, $location, Campaign, $facebook, $filter) {

    //load logged user info
	$facebook.api('/me?fields=id,name,picture').then(function (me) {$scope.me = $filter('finfo')(me);});

    //sum off all scores on all level packs. todo: rename it after prize redemption integration
	$scope.wallet = _.reduce($rootScope.state.state.lpScores, function(memo, lps){ return memo + lps.score; }, 0);

	//retrieves all campaigns, checks if user can take the prize. and enables/disables gui accordingly.
	Campaign.query(function (res) {
		//$scope.campaigns = _.groupBy(res, function(a){ return Math.floor(_.indexOf(res,a)/1)});
		$scope.campaigns = _.map(res, function (camp) {
			camp.available = $scope.wallet >= (camp.prize.cost * 1000);
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
		}
	}

    //navigation
	$scope.charity = function () {
		$location.path('/charity');
	}

	/*
	 var modalInstance = $modal.open({
	 templateUrl: 'partials/prizemodal.html',
	 backdrop:false,
	 controller: PrizeModalCtrl,
	 dialogClass: 'modal',
	 resolve: {
	 points: function () {
	 return true;
	 }
	 }
	 });

	 modalInstance.result.then(function (points) {
	 if (points) {
	 $location.path('/charity');
	 }
	 });  */
}

function PrizeModalCtrl($modal) {

}

function CharityCtrl($scope, $rootScope, Charity, $facebook, $filter, $location, Votes) {

	//load logged user info
	$facebook.api('/me?fields=id,name,picture').then(function (me) {$scope.me = $filter('finfo')(me);});

	//navigation
	$scope.playAgain = function () {
		$location.path('/levelpack/' + $rootScope.state.state.levelPack + '/level/' + $rootScope.state.state.level);
	}
	$scope.quit = function() {
		$location.path('/splash');
	}

	//heart tiling of column lists todo: define up to 519
	function getColumn(i) {
		if (0  <= i && i < 9 ) return 0;
		if (9  <= i && i < 21) return 1;
		if (21 <= i && i < 36) return 2;
		if (36 <= i && i < 53) return 3;
		if (53 <= i && i < 70) return 4;
		if (70 <= i && i < 91) return 5;		
				
	}

	//todo: push to heart after successful post to backend
	//todo: maybe to move this to cloudsave? user could vote many times if he uses back button.
	//we can disable back button or track state if he has voted for lp.
	$scope.vote = function(charity) {
		Votes.save({charityId:charity._id});
		var suma = 0;
		for (var i = 0; i < 27; i++) {
			suma = suma + $scope.players[i].length;
		}
		var j = suma + 1;
		var i = getColumn(j);
	  $scope.players[i].push($facebook.api('/me?fields=id,name,picture'));
		//$scope.players.push($scope.me);
	}

	//get lists of available charities to vote for
	$scope.charities = Charity.query();

	//retrieves data about last heart votes, filled heart, and remaining votes to fill heart
	Votes.get({}, function (votes) {
		$scope.votes = votes;
				
		$scope.players = [];
		for (var i = 0; i < 27; i++) {
			$scope.players[i] = [];
		}
		for (var j = 0; j < votes.playerIds.length; j++) {
			var i = getColumn(j);
		  $scope.players[i].push($facebook.api('/' + votes.playerIds[j].id + '?fields=id,name,picture'));						
		};
	});	
}

function LevelCtrl($scope, $rootScope, $modal, State, $location, Game, $facebook, $filter) {

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

    //refactor this, occurs multiple times in code
	var sc = $rootScope.state.state.lpScores[levelPack];
	if (sc) {
		$scope.lpScore = sc.score;
	} else {
		$scope.lpScore = 0;
	}

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
	$scope.game = Game.get({}, function (game) {

		$scope.game = game;
		$scope.level = game.levelPacks[levelPack].levels[level];

		$scope.answer = [];

		for (var i = 0; i < $scope.level.answer.length; i++) {
			$scope.answer.push('');
		}

    //generates missing letters
		var generated = randomString((12 - $scope.level.answer.length), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');

    //shuffle answer with additional letters
		$scope.other = _.shuffle(($scope.level.answer.toUpperCase() + generated).split(''));

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
	});

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

	$scope.nextLevel = function (points2) {

		if (level == 4) { //todo take 4 from game definition, remove levelPack param
			$location.path('/leaderboard/' + levelPack);
		} else {

			var modalInstance = $modal.open({
				templateUrl: '../../partials/nextlevel.html',
				controller: NextLevelCtrl,
				dialogClass: 'modal',
				resolve: {
					points: function () {
						return points2;
					}
				}
			});

			modalInstance.result.then(function (points) {
				if (points) {
				  //todo remove extra url params
					$location.path('/levelpack/' + $rootScope.state.state.levelPack + '/level/' + $rootScope.state.state.level);
				}
			});
		}

	}

  //timer text info refresh
	$scope.$on('timer-tick', function (event, data) {
		$scope.remains = data.millis / 1000;
	});
}


//navigates to next level
function NextLevelCtrl($scope, $modalInstance, points) {
	$scope.points = points;
	$scope.next = function () {
		$modalInstance.close(points);
	}

}

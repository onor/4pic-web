'use strict';

function SplashCtrl($scope, $rootScope, State, $location, Game, $facebook) {
	
  $facebook.getLoginStatus();

	$scope.game = Game.get({}, function (game) {
		$scope.game = game;
	});
	
	$rootScope.state = State.get();

  $scope.go = function() {
    $location.path('/levelpack/' + $rootScope.state.state.levelPack + '/level/' + $rootScope.state.state.level);
  }

  
  $scope.ld = function() {
    $location.path('/leaderboard/1');
  }

    $scope.prize = function() {
        $location.path('/prize');
    }
}

function LeaderboardCtrl($scope, $rootScope, $location, $facebook, Score) {
	
	$facebook.api('/me?fields=id,name,picture').then(function(me) {
		if (me.picture.data.is_silhouette) {
			$scope.profilePic = "img/ingame/player-pic-holder.png";
		} else {
			$scope.profilePic = me.picture.data.url;
		}
	});

    var levelPack = $rootScope.state.state.levelPack;
		
		$scope.bestScore = _.max($rootScope.state.state.lpScores, function(lps){return lps.score;}).score;

    var sc = $rootScope.state.state.lpScores[levelPack - 1];
	if (sc) {
		$scope.lpScore = sc.score;
	} else {
		$scope.lpScore = 0;
	}

    $facebook.api({
							method : 'fql.query',
							query : 'SELECT uid, name, is_app_user, pic_square FROM user WHERE uid IN (SELECT uid2 FROM friend WHERE uid1 = me()) AND is_app_user = 1'
						}).then(function (friends) {
							$scope.scores = [];
							_.map(friends, function(friend) {
								Score.get({fbid:friend.uid, weekly:false}, function(res) {
									friend.score = res.value;
									$scope.scores.push(friend);
								});
							});	
						});

    Score.query({weekly:true}, function(scores) {
        $scope.weeklyScores = [];
        _.map(scores, function(score) {
            $facebook.api('/' + score._id.playerId.id + '?fields=id,name,picture').then(
                function(response) {
                    $scope.weeklyScores.push({user:response, score: score.value});
                },
                function(response) {
                    alert('error');
                }
            );
		});
	});

    $scope.playAgain = function() {
        $location.path('/levelpack/' + (levelPack + 1) + '/level/' + 0);
    }
    $scope.getPrize = function() {
        $location.path('/prize')
    }
}

function PrizeCtrl($scope, Campaign) {

    var wallet = 1;

    Campaign.query(function(res) {
         //$scope.campaigns = _.groupBy(res, function(a){ return Math.floor(_.indexOf(res,a)/1)});
         $scope.campaigns = _.map(res, function(camp) {
            camp.available = wallet >= camp.prize.cost;
            return camp;
         });
    });
}

function CharityCtrl($scope, $rootScope, $modal)
{
	$scope.getCharity = function() {
       $location.path('/charity');
    }
}

function LevelCtrl($scope, $rootScope, $modal, State, $location, Game, $facebook) {

    $scope.loadedImages = [];

	$scope.$on('levelimageloaded', function() {
      $scope.loadedImages.push(true);
        if($scope.loadedImages.length == 4) {
	  $scope.$broadcast('timer-start');
        }
	});
	
		$facebook.api('/me?fields=id,name,picture').then(function(me) {
			if (me.picture.data.is_silhouette) {
				$scope.profilePic = "img/ingame/player-pic-holder.png";
			} else {
				$scope.profilePic = me.picture.data.url;
			}
		});
	
    var levelPack = $rootScope.state.state.levelPack;
    var level = $rootScope.state.state.level;
		
		if ($rootScope.state.state.seen) {
			$scope.countdownAvailable = 1;
		} else {
			$scope.countdownAvailable = 30;
		}
		
		$rootScope.state.$seenLevel({}, function(res) {
		});
		
		var sc = $rootScope.state.state.lpScores[levelPack];
		if (sc) {
			$scope.lpScore = sc.score;
		} else {
			$scope.lpScore = 0;
		}

    $scope.prizeList = function() {
       $location.path('/prize');
    }

    function randomString(length, chars) {
        var result = '';
        for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
        return result;
    };
	
	$scope.game = Game.get({}, function (game) {
		
		$scope.game = game;
		$scope.level = game.levelPacks[levelPack].levels[level];

		$scope.answer = [];

		for (var i = 0; i < $scope.level.answer.length; i++) {
			$scope.answer.push('');
		}

    var generated =  randomString((12 - $scope.level.answer.length), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');

    $scope.other = _.shuffle(($scope.level.answer.toUpperCase() + generated).split(''));

		$scope.invalid = false;

		$scope.$watch('answer', function (newValue) {
			$scope.invalid = false;

			$scope.correct = $scope.level.answer.toUpperCase() == newValue.join("");
			if ($scope.correct) {
        $scope.$broadcast('timer-stop');
				var points2 = $scope.remains * 10
				$rootScope.state.$resolveLevel({points:points2}, function(res) {
					$scope.nextLevel(points2);
				});
			}

			if ($scope.level.answer.length == newValue.join("").length && !$scope.correct) {
				$scope.invalid = true;
			}
		}, true);
	});

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

    if (level == 4) {
      $location.path('/leaderboard/' + levelPack);
    } else {

			var modalInstance = $modal.open({
				templateUrl: 'partials/nextlevel.html',
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
	        $location.path('/levelpack/' + $rootScope.state.state.levelPack + '/level/' + $rootScope.state.state.level);
				}
			});
    }

	}

	$scope.back = function () {
		$location.path("/splash");
	}

  $scope.$on('timer-tick', function (event, data){
    $scope.remains = data.millis / 1000;
  });
}


function NextLevelCtrl($scope, $modalInstance, points) {
  $scope.points = points;
	$scope.next = function () {
		$modalInstance.close(points);
	}

}

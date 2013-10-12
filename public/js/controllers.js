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
}

function LeaderboardCtrl($scope, $rootScope, $location, $facebook, Leaderboard) {

    var levelPack = $rootScope.state.state.levelPack;

    var sc = $rootScope.state.state.lpScores[levelPack - 1];
	if (sc) {
		$scope.lpScore = sc;
	} else {
		$scope.lpScore = 0;
	}

    $scope.scores = $facebook.api('/' + appConfig.appId + '/scores');
    $scope.publicScores = Leaderboard.query({lp:(levelPack + 1)}, function(ps) {
    	$scope.publicScores = [];
			for (var i = 0; i < ps.length; i++) {
                var uri = '/' + ps[i].playerId.id;

                var j = i + 0;

                $facebook.api(uri).then(
                    function(response) {
                        $scope.publicScores[j] = {user:response, score: ps[j].scoreInt};
                    },
                    function(response) {
                        alert('error');
                    }
                );
			}
    });

    $scope.playAgain = function() {
         $location.path('/levelpack/' + (levelPack + 1) + '/level/' + 0);
     }
    $scope.getPrize = function() {
        $location.path('/prize')
    }
}

function PrizeCtrl($scope, Campaign) {
    Campaign.query(function(res) {
         $scope.campaigns = _.groupBy(res, function(a){ return Math.floor(_.indexOf(res,a)/3)});
    });
}

function LevelCtrl($scope, $rootScope, $dialog, State, $location, Game) {
    var levelPack = $rootScope.state.state.levelPack;
    var level = $rootScope.state.state.level;
		
		var sc = $rootScope.state.state.lpScores[levelPack];
		if (sc) {
			$scope.lpScore = sc;
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

			var modalInstance = $dialog.dialog({
				templateUrl: 'partials/nextlevel.html',
				controller: NextLevelCtrl,
				dialogClass: 'modal',
            resolve: {
            points: function () {
                return points2;
            }
        }
			});

			modalInstance.open().then(function (points) {
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

function NextLevelCtrl($scope, dialog, points) {
  $scope.points = points;
	$scope.next = function () {
		dialog.close(points);
	}

}

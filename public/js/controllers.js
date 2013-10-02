'use strict';

function SplashCtrl($scope, $cookieStore, $location, Game) {
	$scope.game = Game.get({}, function (game) {
		$scope.game = game;

		if ($cookieStore.get('state') == null) {
			var state = {levelPack:0, level:0, score:0};
			$cookieStore.put('state', state);
		}

		$scope.state = $cookieStore.get('state');
	});

    $scope.go = function() {
        $location.path('/levelpack/' + $scope.state.levelPack + '/level/' + $scope.state.level)
    }
}

function LevelCtrl($scope, $routeParams, $dialog, $location, $cookieStore, Game) {

    $scope.state = $cookieStore.get('state');

	function shuffle(o) { //v1.0
		for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
		return o;
	};

	var levelPack = parseInt($routeParams.levelPack);
	var level = parseInt($routeParams.level);
	
	$scope.game = Game.get({}, function (game) {
		
		$scope.game = game;
		$scope.level = game.levelPacks[levelPack].levels[level];

		$scope.answer = [];

		for (var i = 0; i < $scope.level.answer.length; i++) {
			$scope.answer.push('');
		}
		$scope.other = shuffle(($scope.level.answer.toUpperCase() + 'ABH').split(''));

		$scope.invalid = false;

		$scope.$watch('answer', function (newValue) {
			$scope.invalid = false;

			$scope.correct = $scope.level.answer.toUpperCase() == newValue.join("");
			if ($scope.correct) {
                $scope.$broadcast('timer-stop');
				$scope.nextLevel($scope.remains * 10);
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
				$scope.state = $cookieStore.get('state');
				$scope.state.level = $scope.state.level + 1;
                $scope.state.score = $scope.state.score + points;
				$cookieStore.put('state', $scope.state);

				$location.path('/levelpack/' + levelPack + '/level/' + (level + 1))
			}
		});

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

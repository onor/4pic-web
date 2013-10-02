'use strict';

//curl -v  -X 
//GET "http://www.onor.net/client/v1/games/4pics1word/238246943/levelPack/1?userKey=4b1469e3ff90b438ef0134b1cb266c06"

function LevelPacksCtrl($scope, $cookieStore, Game) {
	$scope.game = Game.get({}, function (game) {
		$scope.game = game;

		if ($cookieStore.get('state') == null) {
			var state = [];x

			for (var i = 0; i < $scope.game.levelPacks.length; i++) {
				var blank = [];
				for (var j = 0; j < 25; j++) {
					blank.push(false);
				}
				state.push(blank);
			}

			$cookieStore.put('state', state);
		}

		$scope.state = $cookieStore.get('state');

		$scope.completed = [];
		for (var i = 0; i < $scope.state.length; i++) {
			var count = 0;
			for (var j = 0; j < 25; j++) {
				if ($scope.state[i][j]) count++;
			}
			$scope.completed.push(count * 4);
		}
		debugger;
	});
}

function LevelPackCtrl($scope, $routeParams, $cookieStore, $location, Game) {
	$scope.game = Game.get({}, function (game) {
		$scope.game = game;
		$scope.levelPack = game.levelPacks[$routeParams.levelPack - 1];
		$scope.state = $cookieStore.get('state');
	});

	$scope.back = function () {
		$location.path("/levelpacks");
	}
}

function LevelCtrl($scope, $routeParams, $dialog, $location, $cookieStore, $timeout, Game) {

	function shuffle(o) { //v1.0
		for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
		return o;
	};

	var levelPack = parseInt($routeParams.levelPack);
	var level = parseInt($routeParams.level);
	
	$scope.game = Game.get({}, function (game) {
		
		$scope.game = game;
		$scope.level = game.levelPacks[levelPack - 1].levels[level];

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
				$scope.nextLevel();
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

	$scope.nextLevel = function () {

		var modalInstance = $dialog.dialog({
			templateUrl: 'partials/nextlevel.html',
			controller: NextLevelCtrl,
			dialogClass: 'modal'
		});

		modalInstance.open().then(function (result) {
			if (result) {
				$scope.state = $cookieStore.get('state');
				$scope.state[levelPack - 1][level] = true;
				$cookieStore.put('state', $scope.state);

				$location.path('/levelpack/' + levelPack + '/level/' + (level + 1))
			}
		});

	}


	$scope.back = function () {
		$location.path("/levelpack/" + levelPack);
	}

	function countController( $scope, $timeout )
	{
		debugger;
	    // Provide ternary like support for controller...
	    $scope.when  = function( booleanExpr, trueValue, falseValue) {       
	          return booleanExpr ? trueValue : falseValue;
	    };
	    
	    
	    var isPaused  = false,
	        pause = function() {
	            isPaused = true;
	        },
	        resume = function() {
	            isPaused = false;
	            runCounter();
	        },
	        runCounter = function() {
	            if ( isPaused ) return;
	                
	            $scope.countDown -= 1; 
	            
	            if ( $scope.countDown > 0)        
	                $timeout(runCounter, 1000); 
	        },
	        toggleCounter = function() {
	            isPaused = !isPaused;
	            runCounter();    
	        };

	    //debugger;
	    
	    $scope.countDown = 30;
	    
	    $scope.pause     = pause;
	    $scope.resume    = resume;
	    $scope.isPaused  = function() { 
	        return isPaused; 
	    };
	    $scope.onToggleCounter = toggleCounter;
	    
	    runCounter();
	}
}

function NextLevelCtrl($scope, dialog) {
	$scope.next = function () {
		dialog.close(true);
	}

}

'use strict';

function SplashCtrl($scope, $rootScope, State, $location, $modal, Game, $facebook) {

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

function LeaderboardCtrl($scope, $rootScope, $location, $facebook,$modal, Score, $filter) {

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

function NoLevelModalCtrl($scope, $modalInstance) {
  $scope.close = function() {
		$modalInstance.close("");
  }
}

function PrizeCtrl($scope, $rootScope, $modal, $location, Campaign, $facebook, $filter) {

    //load logged user info
	$facebook.api('/me?fields=id,name,picture').then(function (me) {$scope.me = $filter('finfo')(me);});

    //sum off all scores on all level packs. todo: rename it after prize redemption integration
	$scope.wallet = $rootScope.state.scoreSummary.alltime;

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

function PrizeModalCtrl($scope, $modalInstance) {
  $scope.close = function() {
		$modalInstance.close("");
  }
}

function CharityCtrl($scope, $rootScope, Charity, $facebook, $filter, $location, $modal, Votes) {
	
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
		  	$scope.votes.playerProfiles.push($scope.meForVote);
				$scope.votes.needed = $scope.votes.needed - 1;
				$scope.voted = true;
			});
		}
	}

	//get lists of available charities to vote for
	$scope.charities = Charity.query();

	//retrieves data about last heart votes, filled heart, and remaining votes to fill heart
	$scope.votes = Votes.get({}, function(votes) {
		$scope.playerProfiles = votes.playerProfiles.reverse();
	});	
	
	var positions=[{x:188,y:354,b:1,r:1,c:1},{x:200,y:354,b:1,r:1,c:2},{x:172,y:340,b:1,r:2,c:1},{x:186,y:340,b:1,r:2,c:2},{x:200,y:340,b:1,r:2,c:3},{x:214,y:340,b:1,r:2,c:4},{x:154,y:326,b:1,r:3,c:1},{x:168,y:326,b:1,r:3,c:2},{x:182,y:326,b:0,r:3,c:3},{x:196,y:326,b:0,r:3,c:4},{x:210,y:326,b:0,r:3,c:5},{x:224,y:326,b:1,r:3,c:6},{x:234,y:326,b:1,r:3,c:7},{x:139,y:312,b:1,r:4,c:1},{x:153,y:312,b:1,r:4,c:2},{x:167,y:312,b:0,r:4,c:3},{x:181,y:312,b:0,r:4,c:4},{x:195,y:312,b:0,r:4,c:5},{x:209,y:312,b:0,r:4,c:6},{x:223,y:312,b:0,r:4,c:7},{x:237,y:312,b:1,r:4,c:8},{x:251,y:312,b:1,r:4,c:9},{x:123,y:298,b:1,r:5,c:1},{x:137,y:298,b:0,r:5,c:2},{x:151,y:298,b:0,r:5,c:3},{x:165,y:298,b:0,r:5,c:4},{x:179,y:298,b:0,r:5,c:5},{x:193,y:298,b:0,r:5,c:6},{x:207,y:298,b:0,r:5,c:7},{x:221,y:298,b:0,r:5,c:8},{x:235,y:298,b:0,r:5,c:9},{x:249,y:298,b:0,r:5,c:10},{x:263,y:298,b:1,r:5,c:11},{x:109,y:284,b:1,r:6,c:1},{x:123,y:284,b:0,r:6,c:2},{x:137,y:284,b:0,r:6,c:3},{x:151,y:284,b:0,r:6,c:4},{x:165,y:284,b:0,r:6,c:5},{x:179,y:284,b:0,r:6,c:6},{x:193,y:284,b:0,r:6,c:7},{x:207,y:284,b:0,r:6,c:8},{x:221,y:284,b:0,r:6,c:9},{x:235,y:284,b:0,r:6,c:10},{x:249,y:284,b:0,r:6,c:11},{x:263,y:284,b:0,r:6,c:12},{x:277,y:284,b:1,r:6,c:13},{x:97,y:270,b:1,r:7,c:1},{x:111,y:270,b:0,r:7,c:2},{x:125,y:270,b:0,r:7,c:3},{x:139,y:270,b:0,r:7,c:4},{x:153,y:270,b:0,r:7,c:5},{x:167,y:270,b:0,r:7,c:6},{x:181,y:270,b:0,r:7,c:7},{x:195,y:270,b:0,r:7,c:8},{x:209,y:270,b:0,r:7,c:9},{x:223,y:270,b:0,r:7,c:10},{x:237,y:270,b:0,r:7,c:11},{x:251,y:270,b:0,r:7,c:12},{x:265,y:270,b:0,r:7,c:13},{x:279,y:270,b:1,r:7,c:14},{x:293,y:270,b:1,r:7,c:15},{x:84,y:256,b:1,r:8,c:1},{x:98,y:256,b:0,r:8,c:2},{x:112,y:256,b:0,r:8,c:3},{x:126,y:256,b:0,r:8,c:4},{x:140,y:256,b:0,r:8,c:5},{x:154,y:256,b:0,r:8,c:6},{x:168,y:256,b:0,r:8,c:7},{x:182,y:256,b:0,r:8,c:8},{x:196,y:256,b:0,r:8,c:9},{x:210,y:256,b:0,r:8,c:10},{x:224,y:256,b:0,r:8,c:11},{x:238,y:256,b:0,r:8,c:12},{x:252,y:256,b:0,r:8,c:13},{x:266,y:256,b:0,r:8,c:14},{x:280,y:256,b:0,r:8,c:15},{x:294,y:256,b:1,r:8,c:16},{x:308,y:256,b:1,r:8,c:17},{x:72,y:242,b:1,r:9,c:1},{x:86,y:242,b:0,r:9,c:2},{x:100,y:242,b:0,r:9,c:3},{x:114,y:242,b:0,r:9,c:4},{x:128,y:242,b:0,r:9,c:5},{x:142,y:242,b:0,r:9,c:6},{x:156,y:242,b:0,r:9,c:7},{x:170,y:242,b:0,r:9,c:8},{x:184,y:242,b:0,r:9,c:9},{x:198,y:242,b:0,r:9,c:10},{x:212,y:242,b:0,r:9,c:11},{x:226,y:242,b:0,r:9,c:12},{x:240,y:242,b:0,r:9,c:13},{x:254,y:242,b:0,r:9,c:14},{x:268,y:242,b:0,r:9,c:15},{x:282,y:242,b:0,r:9,c:16},{x:296,y:242,b:0,r:9,c:17},{x:310,y:242,b:1,r:9,c:18},{x:320,y:242,b:1,r:9,c:19},{x:62,y:228,b:1,r:10,c:1},{x:76,y:228,b:0,r:10,c:2},{x:90,y:228,b:0,r:10,c:3},{x:104,y:228,b:0,r:10,c:4},{x:118,y:228,b:0,r:10,c:5},{x:132,y:228,b:0,r:10,c:6},{x:146,y:228,b:0,r:10,c:7},{x:160,y:228,b:0,r:10,c:8},{x:174,y:228,b:0,r:10,c:9},{x:188,y:228,b:0,r:10,c:10},{x:202,y:228,b:0,r:10,c:11},{x:216,y:228,b:0,r:10,c:12},{x:230,y:228,b:0,r:10,c:13},{x:244,y:228,b:0,r:10,c:14},{x:258,y:228,b:0,r:10,c:15},{x:272,y:228,b:0,r:10,c:16},{x:286,y:228,b:0,r:10,c:17},{x:300,y:228,b:0,r:10,c:18},{x:314,y:228,b:0,r:10,c:19},{x:328,y:228,b:1,r:10,c:20},{x:46,y:214,b:1,r:11,c:1},{x:60,y:214,b:0,r:11,c:2},{x:74,y:214,b:0,r:11,c:3},{x:88,y:214,b:0,r:11,c:4},{x:102,y:214,b:0,r:11,c:5},{x:116,y:214,b:0,r:11,c:6},{x:130,y:214,b:0,r:11,c:7},{x:144,y:214,b:0,r:11,c:8},{x:158,y:214,b:0,r:11,c:9},{x:172,y:214,b:0,r:11,c:10},{x:186,y:214,b:0,r:11,c:11},{x:200,y:214,b:0,r:11,c:12},{x:214,y:214,b:0,r:11,c:13},{x:228,y:214,b:0,r:11,c:14},{x:242,y:214,b:0,r:11,c:15},{x:256,y:214,b:0,r:11,c:16},{x:270,y:214,b:0,r:11,c:17},{x:284,y:214,b:0,r:11,c:18},{x:298,y:214,b:0,r:11,c:19},{x:312,y:214,b:0,r:11,c:20},{x:326,y:214,b:1,r:11,c:21},{x:340,y:214,b:1,r:11,c:22},{x:44,y:200,b:1,r:12,c:1},{x:58,y:200,b:0,r:12,c:2},{x:72,y:200,b:0,r:12,c:3},{x:86,y:200,b:0,r:12,c:4},{x:100,y:200,b:0,r:12,c:5},{x:114,y:200,b:0,r:12,c:6},{x:128,y:200,b:0,r:12,c:7},{x:142,y:200,b:0,r:12,c:8},{x:156,y:200,b:0,r:12,c:9},{x:170,y:200,b:0,r:12,c:10},{x:184,y:200,b:0,r:12,c:11},{x:198,y:200,b:0,r:12,c:12},{x:212,y:200,b:0,r:12,c:13},{x:226,y:200,b:0,r:12,c:14},{x:240,y:200,b:0,r:12,c:15},{x:254,y:200,b:0,r:12,c:16},{x:268,y:200,b:0,r:12,c:17},{x:282,y:200,b:0,r:12,c:18},{x:296,y:200,b:0,r:12,c:19},{x:310,y:200,b:0,r:12,c:20},{x:324,y:200,b:1,r:12,c:21},{x:338,y:200,b:1,r:12,c:22},{x:348,y:200,b:1,r:12,c:23},{x:36,y:186,b:1,r:13,c:1},{x:50,y:186,b:0,r:13,c:2},{x:64,y:186,b:0,r:13,c:3},{x:78,y:186,b:0,r:13,c:4},{x:92,y:186,b:0,r:13,c:5},{x:106,y:186,b:0,r:13,c:6},{x:120,y:186,b:0,r:13,c:7},{x:134,y:186,b:0,r:13,c:8},{x:148,y:186,b:0,r:13,c:9},{x:162,y:186,b:0,r:13,c:10},{x:176,y:186,b:0,r:13,c:11},{x:190,y:186,b:0,r:13,c:12},{x:204,y:186,b:0,r:13,c:13},{x:218,y:186,b:0,r:13,c:14},{x:232,y:186,b:0,r:13,c:15},{x:246,y:186,b:0,r:13,c:16},{x:260,y:186,b:0,r:13,c:17},{x:274,y:186,b:0,r:13,c:18},{x:288,y:186,b:0,r:13,c:19},{x:302,y:186,b:0,r:13,c:20},{x:316,y:186,b:0,r:13,c:21},{x:330,y:186,b:0,r:13,c:22},{x:344,y:186,b:1,r:13,c:23},{x:356,y:186,b:1,r:13,c:24},{x:31,y:172,b:1,r:14,c:1},{x:45,y:172,b:0,r:14,c:2},{x:59,y:172,b:0,r:14,c:3},{x:73,y:172,b:0,r:14,c:4},{x:87,y:172,b:0,r:14,c:5},{x:101,y:172,b:0,r:14,c:6},{x:115,y:172,b:0,r:14,c:7},{x:129,y:172,b:0,r:14,c:8},{x:143,y:172,b:0,r:14,c:9},{x:157,y:172,b:0,r:14,c:10},{x:171,y:172,b:0,r:14,c:11},{x:185,y:172,b:0,r:14,c:12},{x:199,y:172,b:0,r:14,c:13},{x:213,y:172,b:0,r:14,c:14},{x:227,y:172,b:0,r:14,c:15},{x:241,y:172,b:0,r:14,c:16},{x:255,y:172,b:0,r:14,c:17},{x:269,y:172,b:0,r:14,c:18},{x:283,y:172,b:0,r:14,c:19},{x:297,y:172,b:0,r:14,c:20},{x:311,y:172,b:0,r:14,c:21},{x:325,y:172,b:0,r:14,c:22},{x:339,y:172,b:0,r:14,c:23},{x:353,y:172,b:1,r:14,c:24},{x:363,y:172,b:1,r:14,c:25},{x:25,y:158,b:1,r:15,c:1},{x:39,y:158,b:0,r:15,c:2},{x:53,y:158,b:0,r:15,c:3},{x:67,y:158,b:0,r:15,c:4},{x:81,y:158,b:0,r:15,c:5},{x:95,y:158,b:0,r:15,c:6},{x:109,y:158,b:0,r:15,c:7},{x:123,y:158,b:0,r:15,c:8},{x:137,y:158,b:0,r:15,c:9},{x:151,y:158,b:0,r:15,c:10},{x:165,y:158,b:0,r:15,c:11},{x:179,y:158,b:0,r:15,c:12},{x:193,y:158,b:0,r:15,c:13},{x:207,y:158,b:0,r:15,c:14},{x:221,y:158,b:0,r:15,c:15},{x:235,y:158,b:0,r:15,c:16},{x:249,y:158,b:0,r:15,c:17},{x:263,y:158,b:0,r:15,c:18},{x:277,y:158,b:0,r:15,c:19},{x:291,y:158,b:0,r:15,c:20},{x:305,y:158,b:0,r:15,c:21},{x:319,y:158,b:0,r:15,c:22},{x:333,y:158,b:0,r:15,c:23},{x:347,y:158,b:0,r:15,c:24},{x:361,y:158,b:1,r:15,c:25},{x:21,y:144,b:1,r:16,c:1},{x:35,y:144,b:0,r:16,c:2},{x:49,y:144,b:0,r:16,c:3},{x:63,y:144,b:0,r:16,c:4},{x:77,y:144,b:0,r:16,c:5},{x:91,y:144,b:0,r:16,c:6},{x:105,y:144,b:0,r:16,c:7},{x:119,y:144,b:0,r:16,c:8},{x:133,y:144,b:0,r:16,c:9},{x:147,y:144,b:0,r:16,c:10},{x:161,y:144,b:0,r:16,c:11},{x:175,y:144,b:0,r:16,c:12},{x:189,y:144,b:0,r:16,c:13},{x:203,y:144,b:0,r:16,c:14},{x:217,y:144,b:0,r:16,c:15},{x:231,y:144,b:0,r:16,c:16},{x:245,y:144,b:0,r:16,c:17},{x:259,y:144,b:0,r:16,c:18},{x:273,y:144,b:0,r:16,c:19},{x:287,y:144,b:0,r:16,c:20},{x:301,y:144,b:0,r:16,c:21},{x:315,y:144,b:0,r:16,c:22},{x:329,y:144,b:0,r:16,c:23},{x:343,y:144,b:0,r:16,c:24},{x:357,y:144,b:0,r:16,c:25},{x:371,y:144,b:1,r:16,c:26},{x:19,y:130,b:1,r:17,c:1},{x:33,y:130,b:0,r:17,c:2},{x:47,y:130,b:0,r:17,c:3},{x:61,y:130,b:0,r:17,c:4},{x:75,y:130,b:0,r:17,c:5},{x:89,y:130,b:0,r:17,c:6},{x:103,y:130,b:0,r:17,c:7},{x:117,y:130,b:0,r:17,c:8},{x:131,y:130,b:0,r:17,c:9},{x:145,y:130,b:0,r:17,c:10},{x:159,y:130,b:0,r:17,c:11},{x:173,y:130,b:0,r:17,c:12},{x:187,y:130,b:0,r:17,c:13},{x:201,y:130,b:0,r:17,c:14},{x:215,y:130,b:0,r:17,c:15},{x:229,y:130,b:0,r:17,c:16},{x:243,y:130,b:0,r:17,c:17},{x:257,y:130,b:0,r:17,c:18},{x:271,y:130,b:0,r:17,c:19},{x:285,y:130,b:0,r:17,c:20},{x:299,y:130,b:0,r:17,c:21},{x:313,y:130,b:0,r:17,c:22},{x:327,y:130,b:0,r:17,c:23},{x:341,y:130,b:0,r:17,c:24},{x:355,y:130,b:0,r:17,c:25},{x:369,y:130,b:1,r:17,c:26},{x:19,y:116,b:1,r:18,c:1},{x:33,y:116,b:0,r:18,c:2},{x:47,y:116,b:0,r:18,c:3},{x:61,y:116,b:0,r:18,c:4},{x:75,y:116,b:0,r:18,c:5},{x:89,y:116,b:0,r:18,c:6},{x:103,y:116,b:0,r:18,c:7},{x:117,y:116,b:0,r:18,c:8},{x:131,y:116,b:0,r:18,c:9},{x:145,y:116,b:0,r:18,c:10},{x:159,y:116,b:0,r:18,c:11},{x:173,y:116,b:0,r:18,c:12},{x:187,y:116,b:1,r:18,c:13},{x:201,y:116,b:1,r:18,c:14},{x:215,y:116,b:0,r:18,c:15},{x:229,y:116,b:0,r:18,c:16},{x:243,y:116,b:0,r:18,c:17},{x:257,y:116,b:0,r:18,c:18},{x:271,y:116,b:0,r:18,c:19},{x:285,y:116,b:0,r:18,c:20},{x:299,y:116,b:0,r:18,c:21},{x:313,y:116,b:0,r:18,c:22},{x:327,y:116,b:0,r:18,c:23},{x:341,y:116,b:0,r:18,c:24},{x:355,y:116,b:0,r:18,c:25},{x:369,y:116,b:1,r:18,c:26},{x:20,y:102,b:1,r:19,c:1},{x:34,y:102,b:0,r:19,c:2},{x:48,y:102,b:0,r:19,c:3},{x:62,y:102,b:0,r:19,c:4},{x:76,y:102,b:0,r:19,c:5},{x:90,y:102,b:0,r:19,c:6},{x:104,y:102,b:0,r:19,c:7},{x:118,y:102,b:0,r:19,c:8},{x:132,y:102,b:0,r:19,c:9},{x:146,y:102,b:0,r:19,c:10},{x:160,y:102,b:0,r:19,c:11},{x:174,y:102,b:1,r:19,c:12},{x:188,y:102,b:1,r:19,c:13},{x:202,y:102,b:1,r:19,c:14},{x:216,y:102,b:1,r:19,c:15},{x:230,y:102,b:0,r:19,c:16},{x:244,y:102,b:0,r:19,c:17},{x:258,y:102,b:0,r:19,c:18},{x:272,y:102,b:0,r:19,c:19},{x:286,y:102,b:0,r:19,c:20},{x:300,y:102,b:0,r:19,c:21},{x:314,y:102,b:0,r:19,c:22},{x:328,y:102,b:0,r:19,c:23},{x:342,y:102,b:0,r:19,c:24},{x:356,y:102,b:0,r:19,c:25},{x:370,y:102,b:1,r:19,c:25},{x:23,y:88,b:1,r:20,c:1},{x:37,y:88,b:0,r:20,c:2},{x:51,y:88,b:0,r:20,c:3},{x:65,y:88,b:0,r:20,c:4},{x:79,y:88,b:0,r:20,c:5},{x:93,y:88,b:0,r:20,c:6},{x:107,y:88,b:0,r:20,c:7},{x:121,y:88,b:0,r:20,c:8},{x:135,y:88,b:0,r:20,c:9},{x:149,y:88,b:0,r:20,c:10},{x:163,y:88,b:0,r:20,c:11},{x:177,y:88,b:1,r:20,c:12},{x:210,y:88,b:1,r:20,c:13},{x:224,y:88,b:0,r:20,c:14},{x:238,y:88,b:0,r:20,c:15},{x:252,y:88,b:0,r:20,c:16},{x:266,y:88,b:0,r:20,c:17},{x:280,y:88,b:0,r:20,c:18},{x:294,y:88,b:0,r:20,c:19},{x:308,y:88,b:0,r:20,c:20},{x:322,y:88,b:0,r:20,c:21},{x:336,y:88,b:0,r:20,c:22},{x:350,y:88,b:0,r:20,c:23},{x:364,y:88,b:1,r:20,c:24},{x:28,y:74,b:1,r:21,c:1},{x:42,y:74,b:0,r:21,c:2},{x:56,y:74,b:0,r:21,c:3},{x:70,y:74,b:0,r:21,c:4},{x:84,y:74,b:0,r:21,c:5},{x:98,y:74,b:0,r:21,c:6},{x:112,y:74,b:0,r:21,c:7},{x:126,y:74,b:0,r:21,c:8},{x:140,y:74,b:0,r:21,c:9},{x:154,y:74,b:0,r:21,c:10},{x:168,y:74,b:1,r:21,c:11},{x:216,y:74,b:1,r:21,c:12},{x:230,y:74,b:0,r:21,c:13},{x:244,y:74,b:0,r:21,c:14},{x:258,y:74,b:0,r:21,c:15},{x:272,y:74,b:0,r:21,c:16},{x:286,y:74,b:0,r:21,c:17},{x:300,y:74,b:0,r:21,c:18},{x:314,y:74,b:0,r:21,c:19},{x:328,y:74,b:0,r:21,c:20},{x:342,y:74,b:0,r:21,c:21},{x:356,y:74,b:1,r:21,c:21},{x:366,y:74,b:1,r:21,c:21},{x:34,y:60,b:1,r:22,c:1},{x:48,y:60,b:0,r:22,c:2},{x:62,y:60,b:0,r:22,c:3},{x:76,y:60,b:0,r:22,c:4},{x:90,y:60,b:0,r:22,c:5},{x:104,y:60,b:0,r:22,c:6},{x:118,y:60,b:0,r:22,c:7},{x:132,y:60,b:0,r:22,c:8},{x:146,y:60,b:1,r:22,c:9},{x:160,y:60,b:1,r:22,c:10},{x:228,y:60,b:1,r:22,c:11},{x:242,y:60,b:1,r:22,c:12},{x:256,y:60,b:0,r:22,c:13},{x:270,y:60,b:0,r:22,c:14},{x:284,y:60,b:0,r:22,c:15},{x:298,y:60,b:0,r:22,c:16},{x:312,y:60,b:0,r:22,c:17},{x:326,y:60,b:0,r:22,c:18},{x:340,y:60,b:0,r:22,c:19},{x:354,y:60,b:1,r:22,c:20},{x:44,y:46,b:1,r:23,c:1},{x:58,y:46,b:1,r:23,c:2},{x:72,y:46,b:0,r:23,c:3},{x:86,y:46,b:0,r:23,c:4},{x:100,y:46,b:0,r:23,c:5},{x:114,y:46,b:0,r:23,c:6},{x:128,y:46,b:1,r:23,c:7},{x:142,y:46,b:1,r:23,c:8},{x:244,y:46,b:1,r:23,c:9},{x:258,y:46,b:1,r:23,c:10},{x:272,y:46,b:0,r:23,c:11},{x:286,y:46,b:0,r:23,c:12},{x:300,y:46,b:0,r:23,c:13},{x:314,y:46,b:0,r:23,c:14},{x:328,y:46,b:1,r:23,c:14},{x:342,y:46,b:1,r:23,c:14},{x:60,y:32,b:1,r:23,c:1},{x:74,y:32,b:1,r:23,c:2},{x:88,y:32,b:1,r:23,c:3},{x:102,y:32,b:1,r:23,c:4},{x:116,y:32,b:1,r:23,c:5},{x:126,y:32,b:1,r:23,c:6},{x:264,y:32,b:1,r:23,c:7},{x:278,y:32,b:1,r:23,c:8},{x:292,y:32,b:1,r:23,c:9},{x:306,y:32,b:1,r:23,c:10},{x:320,y:32,b:1,r:23,c:11},{x:326,y:32,b:1,r:23,c:12}];		
	
	var imageSize = 14;
	$scope.heartStyle = function(i) {
		var p = positions[i];
		return {
			top:(p.y - imageSize) + 'px', 
			left:(p.x) + 'px'
		}
	}
	$scope.borderStyle = function(i) {
		var p = positions[i];
		if(p.b == 1) {
			return {
				"background-position": '-' + (p.x) + 'px -' + (p.y - imageSize) + 'px',
			}
		} else {
			return {
				"background-position": '-' + (p.x) + 'px -' + (p.y - imageSize) + 'px',
				"display":'none'
			}
		}
	}
}

function LevelCtrl($scope, $rootScope, $modal, State, $location, $facebook, $filter, $route) {

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

function HintCtrl($scope, $rootScope, $modalInstance) {
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
function NextLevelCtrl($scope, $modalInstance, points) {
	$scope.points = points;
	$scope.next = function () {
		$modalInstance.close(points);
	}

}

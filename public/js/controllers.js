'use strict';

function SplashCtrl($scope, $rootScope, State, $location, Game, $facebook) {

    //todo: refactor so that game def is loaded only once.
	$rootScope.game = Game.get({});

	$rootScope.state = State.get();

	$scope.go = function () {
		$location.path('/level');
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
		$location.path('/level');
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
	
	var positions=[{x:199,y:367,b:1,r:1,c:1},{x:213,y:367,b:1,r:1,c:2},{x:181,y:353,b:1,r:2,c:1},{x:195,y:353,b:0,r:2,c:2},{x:209,y:353,b:0,r:2,c:3},{x:223,y:353,b:1,r:2,c:4},{x:163,y:339,b:1,r:3,c:1},{x:177,y:339,b:0,r:3,c:2},{x:191,y:339,b:0,r:3,c:3},{x:205,y:339,b:0,r:3,c:4},{x:219,y:339,b:0,r:3,c:5},{x:233,y:339,b:0,r:3,c:6},{x:247,y:339,b:1,r:3,c:7},{x:148,y:325,b:1,r:4,c:1},{x:162,y:325,b:0,r:4,c:2},{x:176,y:325,b:0,r:4,c:3},{x:190,y:325,b:0,r:4,c:4},{x:204,y:325,b:0,r:4,c:5},{x:218,y:325,b:0,r:4,c:6},{x:232,y:325,b:0,r:4,c:7},{x:246,y:325,b:0,r:4,c:8},{x:260,y:325,b:1,r:4,c:9},{x:132,y:311,b:1,r:5,c:1},{x:146,y:311,b:0,r:5,c:2},{x:160,y:311,b:0,r:5,c:3},{x:174,y:311,b:0,r:5,c:4},{x:188,y:311,b:0,r:5,c:5},{x:202,y:311,b:0,r:5,c:6},{x:216,y:311,b:0,r:5,c:7},{x:230,y:311,b:0,r:5,c:8},{x:244,y:311,b:0,r:5,c:9},{x:258,y:311,b:0,r:5,c:10},{x:272,y:311,b:1,r:5,c:11},{x:117,y:297,b:1,r:6,c:1},{x:131,y:297,b:0,r:6,c:2},{x:145,y:297,b:0,r:6,c:3},{x:159,y:297,b:0,r:6,c:4},{x:173,y:297,b:0,r:6,c:5},{x:187,y:297,b:0,r:6,c:6},{x:201,y:297,b:0,r:6,c:7},{x:215,y:297,b:0,r:6,c:8},{x:229,y:297,b:0,r:6,c:9},{x:243,y:297,b:0,r:6,c:10},{x:257,y:297,b:0,r:6,c:11},{x:271,y:297,b:0,r:6,c:12},{x:285,y:297,b:1,r:6,c:13},{x:104,y:283,b:1,r:7,c:1},{x:118,y:283,b:0,r:7,c:2},{x:132,y:283,b:0,r:7,c:3},{x:146,y:283,b:0,r:7,c:4},{x:160,y:283,b:0,r:7,c:5},{x:174,y:283,b:0,r:7,c:6},{x:188,y:283,b:0,r:7,c:7},{x:202,y:283,b:0,r:7,c:8},{x:216,y:283,b:0,r:7,c:9},{x:230,y:283,b:0,r:7,c:10},{x:244,y:283,b:0,r:7,c:11},{x:258,y:283,b:0,r:7,c:12},{x:272,y:283,b:0,r:7,c:13},{x:286,y:283,b:0,r:7,c:14},{x:300,y:283,b:1,r:7,c:15},{x:91,y:269,b:1,r:8,c:1},{x:105,y:269,b:0,r:8,c:2},{x:119,y:269,b:0,r:8,c:3},{x:133,y:269,b:0,r:8,c:4},{x:147,y:269,b:0,r:8,c:5},{x:161,y:269,b:0,r:8,c:6},{x:175,y:269,b:0,r:8,c:7},{x:189,y:269,b:0,r:8,c:8},{x:203,y:269,b:0,r:8,c:9},{x:217,y:269,b:0,r:8,c:10},{x:231,y:269,b:0,r:8,c:11},{x:245,y:269,b:0,r:8,c:12},{x:259,y:269,b:0,r:8,c:13},{x:273,y:269,b:0,r:8,c:14},{x:287,y:269,b:0,r:8,c:15},{x:301,y:269,b:0,r:8,c:16},{x:315,y:269,b:1,r:8,c:17},{x:78,y:255,b:1,r:9,c:1},{x:92,y:255,b:0,r:9,c:2},{x:106,y:255,b:0,r:9,c:3},{x:120,y:255,b:0,r:9,c:4},{x:134,y:255,b:0,r:9,c:5},{x:148,y:255,b:0,r:9,c:6},{x:162,y:255,b:0,r:9,c:7},{x:176,y:255,b:0,r:9,c:8},{x:190,y:255,b:0,r:9,c:9},{x:204,y:255,b:0,r:9,c:10},{x:218,y:255,b:0,r:9,c:11},{x:232,y:255,b:0,r:9,c:12},{x:246,y:255,b:0,r:9,c:13},{x:260,y:255,b:0,r:9,c:14},{x:274,y:255,b:0,r:9,c:15},{x:288,y:255,b:0,r:9,c:16},{x:302,y:255,b:0,r:9,c:17},{x:316,y:255,b:0,r:9,c:18},{x:330,y:255,b:1,r:9,c:19},{x:66,y:241,b:1,r:10,c:1},{x:80,y:241,b:0,r:10,c:2},{x:94,y:241,b:0,r:10,c:3},{x:108,y:241,b:0,r:10,c:4},{x:122,y:241,b:0,r:10,c:5},{x:136,y:241,b:0,r:10,c:6},{x:150,y:241,b:0,r:10,c:7},{x:164,y:241,b:0,r:10,c:8},{x:178,y:241,b:0,r:10,c:9},{x:192,y:241,b:0,r:10,c:10},{x:206,y:241,b:0,r:10,c:11},{x:220,y:241,b:0,r:10,c:12},{x:234,y:241,b:0,r:10,c:13},{x:248,y:241,b:0,r:10,c:14},{x:262,y:241,b:0,r:10,c:15},{x:276,y:241,b:0,r:10,c:16},{x:290,y:241,b:0,r:10,c:17},{x:304,y:241,b:0,r:10,c:18},{x:318,y:241,b:0,r:10,c:19},{x:332,y:241,b:0,r:10,c:20},{x:346,y:241,b:1,r:10,c:21},{x:57,y:227,b:1,r:11,c:1},{x:71,y:227,b:0,r:11,c:2},{x:85,y:227,b:0,r:11,c:3},{x:99,y:227,b:0,r:11,c:4},{x:113,y:227,b:0,r:11,c:5},{x:127,y:227,b:0,r:11,c:6},{x:141,y:227,b:0,r:11,c:7},{x:155,y:227,b:0,r:11,c:8},{x:169,y:227,b:0,r:11,c:9},{x:183,y:227,b:0,r:11,c:10},{x:197,y:227,b:0,r:11,c:11},{x:211,y:227,b:0,r:11,c:12},{x:225,y:227,b:0,r:11,c:13},{x:239,y:227,b:0,r:11,c:14},{x:253,y:227,b:0,r:11,c:15},{x:267,y:227,b:0,r:11,c:16},{x:281,y:227,b:0,r:11,c:17},{x:295,y:227,b:0,r:11,c:18},{x:309,y:227,b:0,r:11,c:19},{x:323,y:227,b:0,r:11,c:20},{x:337,y:227,b:0,r:11,c:21},{x:351,y:227,b:1,r:11,c:22},{x:47,y:213,b:1,r:12,c:1},{x:61,y:213,b:0,r:12,c:2},{x:75,y:213,b:0,r:12,c:3},{x:89,y:213,b:0,r:12,c:4},{x:103,y:213,b:0,r:12,c:5},{x:117,y:213,b:0,r:12,c:6},{x:131,y:213,b:0,r:12,c:7},{x:145,y:213,b:0,r:12,c:8},{x:159,y:213,b:0,r:12,c:9},{x:173,y:213,b:0,r:12,c:10},{x:187,y:213,b:0,r:12,c:11},{x:201,y:213,b:0,r:12,c:12},{x:215,y:213,b:0,r:12,c:13},{x:229,y:213,b:0,r:12,c:14},{x:243,y:213,b:0,r:12,c:15},{x:257,y:213,b:0,r:12,c:16},{x:271,y:213,b:0,r:12,c:17},{x:285,y:213,b:0,r:12,c:18},{x:299,y:213,b:0,r:12,c:19},{x:313,y:213,b:0,r:12,c:20},{x:327,y:213,b:0,r:12,c:21},{x:341,y:213,b:0,r:12,c:22},{x:355,y:213,b:1,r:12,c:23},{x:38,y:199,b:1,r:13,c:1},{x:52,y:199,b:0,r:13,c:2},{x:66,y:199,b:0,r:13,c:3},{x:80,y:199,b:0,r:13,c:4},{x:94,y:199,b:0,r:13,c:5},{x:108,y:199,b:0,r:13,c:6},{x:122,y:199,b:0,r:13,c:7},{x:136,y:199,b:0,r:13,c:8},{x:150,y:199,b:0,r:13,c:9},{x:164,y:199,b:0,r:13,c:10},{x:178,y:199,b:0,r:13,c:11},{x:192,y:199,b:0,r:13,c:12},{x:206,y:199,b:0,r:13,c:13},{x:220,y:199,b:0,r:13,c:14},{x:234,y:199,b:0,r:13,c:15},{x:248,y:199,b:0,r:13,c:16},{x:262,y:199,b:0,r:13,c:17},{x:276,y:199,b:0,r:13,c:18},{x:290,y:199,b:0,r:13,c:19},{x:304,y:199,b:0,r:13,c:20},{x:318,y:199,b:0,r:13,c:21},{x:332,y:199,b:0,r:13,c:22},{x:346,y:199,b:0,r:13,c:23},{x:360,y:199,b:0,r:13,c:24},{x:374,y:199,b:1,r:13,c:25},{x:31,y:185,b:1,r:14,c:1},{x:45,y:185,b:0,r:14,c:2},{x:59,y:185,b:0,r:14,c:3},{x:73,y:185,b:0,r:14,c:4},{x:87,y:185,b:0,r:14,c:5},{x:101,y:185,b:0,r:14,c:6},{x:115,y:185,b:0,r:14,c:7},{x:129,y:185,b:0,r:14,c:8},{x:143,y:185,b:0,r:14,c:9},{x:157,y:185,b:0,r:14,c:10},{x:171,y:185,b:0,r:14,c:11},{x:185,y:185,b:0,r:14,c:12},{x:199,y:185,b:0,r:14,c:13},{x:213,y:185,b:0,r:14,c:14},{x:227,y:185,b:0,r:14,c:15},{x:241,y:185,b:0,r:14,c:16},{x:255,y:185,b:0,r:14,c:17},{x:269,y:185,b:0,r:14,c:18},{x:283,y:185,b:0,r:14,c:19},{x:297,y:185,b:0,r:14,c:20},{x:311,y:185,b:0,r:14,c:21},{x:325,y:185,b:0,r:14,c:22},{x:339,y:185,b:0,r:14,c:23},{x:353,y:185,b:0,r:14,c:24},{x:367,y:185,b:0,r:14,c:25},{x:381,y:185,b:1,r:14,c:26},{x:25,y:171,b:1,r:15,c:1},{x:39,y:171,b:0,r:15,c:2},{x:53,y:171,b:0,r:15,c:3},{x:67,y:171,b:0,r:15,c:4},{x:81,y:171,b:0,r:15,c:5},{x:95,y:171,b:0,r:15,c:6},{x:109,y:171,b:0,r:15,c:7},{x:123,y:171,b:0,r:15,c:8},{x:137,y:171,b:0,r:15,c:9},{x:151,y:171,b:0,r:15,c:10},{x:165,y:171,b:0,r:15,c:11},{x:179,y:171,b:0,r:15,c:12},{x:193,y:171,b:0,r:15,c:13},{x:207,y:171,b:0,r:15,c:14},{x:221,y:171,b:0,r:15,c:15},{x:235,y:171,b:0,r:15,c:16},{x:249,y:171,b:0,r:15,c:17},{x:263,y:171,b:0,r:15,c:18},{x:277,y:171,b:0,r:15,c:19},{x:291,y:171,b:0,r:15,c:20},{x:305,y:171,b:0,r:15,c:21},{x:319,y:171,b:0,r:15,c:22},{x:333,y:171,b:0,r:15,c:23},{x:347,y:171,b:0,r:15,c:24},{x:361,y:171,b:0,r:15,c:25},{x:375,y:171,b:0,r:15,c:26},{x:389,y:171,b:1,r:15,c:27},{x:20,y:157,b:1,r:16,c:1},{x:34,y:157,b:0,r:16,c:2},{x:48,y:157,b:0,r:16,c:3},{x:62,y:157,b:0,r:16,c:4},{x:76,y:157,b:0,r:16,c:5},{x:90,y:157,b:0,r:16,c:6},{x:104,y:157,b:0,r:16,c:7},{x:118,y:157,b:0,r:16,c:8},{x:132,y:157,b:0,r:16,c:9},{x:146,y:157,b:0,r:16,c:10},{x:160,y:157,b:0,r:16,c:11},{x:174,y:157,b:0,r:16,c:12},{x:188,y:157,b:0,r:16,c:13},{x:202,y:157,b:0,r:16,c:14},{x:216,y:157,b:0,r:16,c:15},{x:230,y:157,b:0,r:16,c:16},{x:244,y:157,b:0,r:16,c:17},{x:258,y:157,b:0,r:16,c:18},{x:272,y:157,b:0,r:16,c:19},{x:286,y:157,b:0,r:16,c:20},{x:300,y:157,b:0,r:16,c:21},{x:314,y:157,b:0,r:16,c:22},{x:328,y:157,b:0,r:16,c:23},{x:342,y:157,b:0,r:16,c:24},{x:356,y:157,b:0,r:16,c:25},{x:370,y:157,b:0,r:16,c:26},{x:384,y:157,b:1,r:16,c:27},{x:16,y:143,b:1,r:17,c:1},{x:30,y:143,b:0,r:17,c:2},{x:44,y:143,b:0,r:17,c:3},{x:58,y:143,b:0,r:17,c:4},{x:72,y:143,b:0,r:17,c:5},{x:86,y:143,b:0,r:17,c:6},{x:100,y:143,b:0,r:17,c:7},{x:114,y:143,b:0,r:17,c:8},{x:128,y:143,b:0,r:17,c:9},{x:142,y:143,b:0,r:17,c:10},{x:156,y:143,b:0,r:17,c:11},{x:170,y:143,b:0,r:17,c:12},{x:184,y:143,b:0,r:17,c:13},{x:198,y:143,b:0,r:17,c:14},{x:212,y:143,b:0,r:17,c:15},{x:226,y:143,b:0,r:17,c:16},{x:240,y:143,b:0,r:17,c:17},{x:254,y:143,b:0,r:17,c:18},{x:268,y:143,b:0,r:17,c:19},{x:282,y:143,b:0,r:17,c:20},{x:296,y:143,b:0,r:17,c:21},{x:310,y:143,b:0,r:17,c:22},{x:324,y:143,b:0,r:17,c:23},{x:338,y:143,b:0,r:17,c:24},{x:352,y:143,b:0,r:17,c:25},{x:366,y:143,b:0,r:17,c:26},{x:380,y:143,b:0,r:17,c:27},{x:394,y:143,b:1,r:17,c:28},{x:14,y:129,b:1,r:18,c:1},{x:28,y:129,b:0,r:18,c:2},{x:42,y:129,b:0,r:18,c:3},{x:56,y:129,b:0,r:18,c:4},{x:70,y:129,b:0,r:18,c:5},{x:84,y:129,b:0,r:18,c:6},{x:98,y:129,b:0,r:18,c:7},{x:112,y:129,b:0,r:18,c:8},{x:126,y:129,b:0,r:18,c:9},{x:140,y:129,b:0,r:18,c:10},{x:154,y:129,b:0,r:18,c:11},{x:168,y:129,b:0,r:18,c:12},{x:182,y:129,b:0,r:18,c:13},{x:196,y:129,b:0,r:18,c:14},{x:210,y:129,b:0,r:18,c:15},{x:224,y:129,b:0,r:18,c:16},{x:238,y:129,b:0,r:18,c:17},{x:252,y:129,b:0,r:18,c:18},{x:266,y:129,b:0,r:18,c:19},{x:280,y:129,b:0,r:18,c:20},{x:294,y:129,b:0,r:18,c:21},{x:308,y:129,b:0,r:18,c:22},{x:322,y:129,b:0,r:18,c:23},{x:336,y:129,b:0,r:18,c:24},{x:350,y:129,b:0,r:18,c:25},{x:364,y:129,b:0,r:18,c:26},{x:378,y:129,b:0,r:18,c:27},{x:392,y:129,b:1,r:18,c:28},{x:14,y:115,b:1,r:19,c:1},{x:28,y:115,b:0,r:19,c:2},{x:42,y:115,b:0,r:19,c:3},{x:56,y:115,b:0,r:19,c:4},{x:70,y:115,b:0,r:19,c:5},{x:84,y:115,b:0,r:19,c:6},{x:98,y:115,b:0,r:19,c:7},{x:112,y:115,b:0,r:19,c:8},{x:126,y:115,b:0,r:19,c:9},{x:140,y:115,b:0,r:19,c:10},{x:154,y:115,b:0,r:19,c:11},{x:168,y:115,b:0,r:19,c:12},{x:182,y:115,b:0,r:19,c:13},{x:196,y:115,b:1,r:19,c:14},{x:209,y:115,b:1,r:19,c:15},{x:223,y:115,b:1,r:19,c:16},{x:237,y:115,b:0,r:19,c:17},{x:251,y:115,b:0,r:19,c:18},{x:265,y:115,b:0,r:19,c:19},{x:279,y:115,b:0,r:19,c:20},{x:293,y:115,b:0,r:19,c:21},{x:307,y:115,b:0,r:19,c:22},{x:321,y:115,b:0,r:19,c:23},{x:335,y:115,b:0,r:19,c:24},{x:349,y:115,b:0,r:19,c:25},{x:363,y:115,b:0,r:19,c:26},{x:377,y:115,b:0,r:19,c:27},{x:391,y:115,b:1,r:19,c:28},{x:15,y:101,b:1,r:20,c:1},{x:29,y:101,b:0,r:20,c:2},{x:43,y:101,b:0,r:20,c:3},{x:57,y:101,b:0,r:20,c:4},{x:71,y:101,b:0,r:20,c:5},{x:85,y:101,b:0,r:20,c:6},{x:99,y:101,b:0,r:20,c:7},{x:113,y:101,b:0,r:20,c:8},{x:127,y:101,b:0,r:20,c:9},{x:141,y:101,b:0,r:20,c:10},{x:155,y:101,b:0,r:20,c:11},{x:169,y:101,b:0,r:20,c:12},{x:183,y:101,b:1,r:20,c:13},{x:223,y:101,b:1,r:20,c:15},{x:237,y:101,b:0,r:20,c:16},{x:251,y:101,b:0,r:20,c:17},{x:265,y:101,b:0,r:20,c:18},{x:279,y:101,b:0,r:20,c:19},{x:293,y:101,b:0,r:20,c:20},{x:307,y:101,b:0,r:20,c:21},{x:321,y:101,b:0,r:20,c:22},{x:335,y:101,b:0,r:20,c:23},{x:349,y:101,b:0,r:20,c:24},{x:363,y:101,b:0,r:20,c:25},{x:377,y:101,b:0,r:20,c:26},{x:391,y:101,b:1,r:20,c:27},{x:19,y:87,b:1,r:21,c:1},{x:33,y:87,b:0,r:21,c:2},{x:47,y:87,b:0,r:21,c:3},{x:61,y:87,b:0,r:21,c:4},{x:75,y:87,b:0,r:21,c:5},{x:89,y:87,b:0,r:21,c:6},{x:103,y:87,b:0,r:21,c:7},{x:117,y:87,b:0,r:21,c:8},{x:131,y:87,b:0,r:21,c:9},{x:145,y:87,b:0,r:21,c:10},{x:159,y:87,b:0,r:21,c:11},{x:173,y:87,b:1,r:21,c:12},{x:229,y:87,b:1,r:21,c:14},{x:243,y:87,b:0,r:21,c:15},{x:257,y:87,b:0,r:21,c:16},{x:271,y:87,b:0,r:21,c:17},{x:285,y:87,b:0,r:21,c:18},{x:299,y:87,b:0,r:21,c:19},{x:313,y:87,b:0,r:21,c:20},{x:327,y:87,b:0,r:21,c:21},{x:341,y:87,b:0,r:21,c:22},{x:355,y:87,b:0,r:21,c:23},{x:369,y:87,b:0,r:21,c:24},{x:383,y:87,b:1,r:21,c:25},{x:25,y:73,b:1,r:22,c:1},{x:39,y:73,b:0,r:22,c:2},{x:53,y:73,b:0,r:22,c:3},{x:67,y:73,b:0,r:22,c:4},{x:81,y:73,b:0,r:22,c:5},{x:95,y:73,b:0,r:22,c:6},{x:109,y:73,b:0,r:22,c:7},{x:123,y:73,b:0,r:22,c:8},{x:137,y:73,b:0,r:22,c:9},{x:151,y:73,b:0,r:22,c:10},{x:165,y:73,b:1,r:22,c:11},{x:238,y:73,b:1,r:22,c:13},{x:252,y:73,b:0,r:22,c:14},{x:266,y:73,b:0,r:22,c:15},{x:280,y:73,b:0,r:22,c:16},{x:294,y:73,b:0,r:22,c:17},{x:308,y:73,b:0,r:22,c:18},{x:322,y:73,b:0,r:22,c:19},{x:336,y:73,b:0,r:22,c:20},{x:350,y:73,b:0,r:22,c:21},{x:364,y:73,b:0,r:22,c:22},{x:378,y:73,b:1,r:22,c:23},{x:32,y:59,b:1,r:23,c:1},{x:46,y:59,b:0,r:23,c:2},{x:60,y:59,b:0,r:23,c:3},{x:74,y:59,b:0,r:23,c:4},{x:88,y:59,b:0,r:23,c:5},{x:102,y:59,b:0,r:23,c:6},{x:116,y:59,b:0,r:23,c:7},{x:130,y:59,b:0,r:23,c:8},{x:144,y:59,b:0,r:23,c:9},{x:158,y:59,b:1,r:23,c:10},{x:249,y:59,b:1,r:23,c:12},{x:263,y:59,b:0,r:23,c:13},{x:277,y:59,b:0,r:23,c:14},{x:291,y:59,b:0,r:23,c:15},{x:305,y:59,b:0,r:23,c:16},{x:319,y:59,b:0,r:23,c:17},{x:333,y:59,b:0,r:23,c:18},{x:347,y:59,b:0,r:23,c:19},{x:361,y:59,b:0,r:23,c:20},{x:375,y:59,b:1,r:23,c:21},{x:44,y:45,b:1,r:24,c:1},{x:58,y:45,b:0,r:24,c:2},{x:72,y:45,b:0,r:24,c:3},{x:86,y:45,b:0,r:24,c:4},{x:100,y:45,b:0,r:24,c:5},{x:114,y:45,b:0,r:24,c:6},{x:128,y:45,b:0,r:24,c:7},{x:142,y:45,b:1,r:24,c:8},{x:265,y:45,b:1,r:24,c:10},{x:279,y:45,b:0,r:24,c:11},{x:293,y:45,b:0,r:24,c:12},{x:307,y:45,b:0,r:24,c:13},{x:321,y:45,b:0,r:24,c:14},{x:335,y:45,b:0,r:24,c:15},{x:349,y:45,b:0,r:24,c:16},{x:363,y:45,b:1,r:24,c:17},{x:65,y:31,b:1,r:25,c:1},{x:79,y:31,b:1,r:25,c:2},{x:93,y:31,b:1,r:25,c:3},{x:107,y:31,b:1,r:25,c:4},{x:121,y:31,b:1,r:25,c:5},{x:285,y:31,b:1,r:25,c:6},{x:299,y:31,b:1,r:25,c:7},{x:313,y:31,b:1,r:25,c:8},{x:327,y:31,b:1,r:25,c:9},{x:341,y:31,b:1,r:25,c:10}];
	//load logged user info
	$facebook.api('/me?fields=id,name,picture').then(function (me) {$scope.me = $filter('finfo')(me);});

	//navigation
	$scope.playAgain = function () {
		$location.path('/level');
	}
	$scope.quit = function() {
		$location.path('/splash');
	}

	//todo: push to heart after successful post to backend
	//todo: maybe to move this to cloudsave? user could vote many times if he uses back button.
	//we can disable back button or track state if he has voted for lp.
	$scope.vote = function(charity) {
		Votes.save({charityId:charity._id}, function() {
		  $scope.players.push($facebook.api('/me?fields=id,name,picture'));
			$scope.votes.needed = $scope.votes.needed - 1;
		});
	}

	var imageSize = 14;
	$scope.heartStyle = function(i) {
		var p = positions[i];
		var t = (p.y - imageSize) + 'px';
		var l = (p.x) + 'px';
		return {
			top:t, 
			left:l
		}
	}	
	$scope.borderStyle = function(i) {
		var p = positions[i];
		var tmp = '-' + (p.x) + 'px -' + (p.y - imageSize) + 'px';
		return {
			"background-position": tmp
		}
	}
	$scope.showBorder = function(i) {
		return (positions[i].b == 1);
	}

	//get lists of available charities to vote for
	$scope.charities = Charity.query();

	//retrieves data about last heart votes, filled heart, and remaining votes to fill heart
	Votes.get({}, function (votes) {
		$scope.votes = votes;
				
		$scope.players = [];
		
		for (var j = 0; j < votes.playerIds.length; j++) {
		  $scope.players.push($facebook.api('/' + votes.playerIds[j].id + '?fields=id,name,picture'));						
		};
	});	
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

	$scope.hint = function() {
		//User has selected Question Mark

		

		var modalInstance = $modal.open({
				templateUrl: '../../partials/hint.html',
				controller: HintCtrl,
				backdrop:true				
				});

		modalInstance.result.then(function (msg) {
				if (msg == "revealLetters") {
					$rootScope.state.$hint({hint: 10}, function (res) {					
						$scope.revealLetter();
					});
				}
				else if (msg == "removeLetters") {
					$rootScope.state.$hint({hint: 40}, function (res) {					
						$scope.removeLetters();
					});
				}

			});
	}
	
	$scope.levels = $rootScope.game.levelPacks[levelPack].levels;

	$scope.nextLevel = function (points2) {

		if (level == $scope.levels.length) { //todo take 4 from game definition, remove levelPack param
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

function HintCtrl($scope, $modalInstance) {
	$scope.removeLetters = function () {
		$modalInstance.close("removeLetters");
	}

	$scope.revealLetters = function () {
	   $modalInstance.close("revealLetters");
	}


}

//navigates to next level
function NextLevelCtrl($scope, $modalInstance, points) {
	$scope.points = points;
	$scope.next = function () {
		$modalInstance.close(points);
	}

}

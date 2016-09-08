/*********
 PLAYER
 Player objects store Player Ranking data from ESPN
 *********/
var Player = function(rank, name, team, position, fg, ft, tpm, reb, ast, stl, blk, pts, total){
	this.RANK = rank;
	this.NAME = name;
	this.TEAM = team;
	this.POSITION = position;
	this.FG = fg;
	this.FT = ft;
	this.TPM = tpm;
	this.REB = reb;
	this.AST = ast;
	this.STL = stl;
	this.BLK = blk;
	this.PTS = pts;
	this.TOTAL = total;
}

Player.prototype.get = function(stat){
	if (stat == "FG") return this.FG;
	else if (stat == "FT") return this.FT;
	else if (stat == "TPM") return this.TPM;
	else if (stat == "REB") return this.REB;
	else if (stat == "AST") return this.AST;
	else if (stat == "STL") return this.STL;
	else if (stat == "BLK") return this.BLK;
	else if (stat == "PTS") return this.PTS;
	else if (stat == "TOTAL") return this.TOTAL;
	else if (stat == "RANK") return this.RANK;
	else if (stat == "NAME") return this.NAME;
	else if (stat == "TEAM") return this.TEAM;
	else if (stat == "POSITION") return this.POSITION;
	else return 0;
}

/*********
 TEAM
 Team objects have an array of players called "team" and the size of the array.
 *********/

var Team = function(){
	this.team = [];
	this.teamSize = 0;
}

Team.prototype.add = function(){
	if (arguments.length > 1){
			var newPlayer = new Player(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6], arguments[7], arguments[8], arguments[9], arguments[10], arguments[11], arguments[12])
			this.team[this.teamSize] = newPlayer;
	}
	else if (arguments.length == 1){
		this.team[this.teamSize] = arguments[0];
	}
	this.teamSize++;
}

Team.prototype.get = function(player){
	for (var i = 0; i < this.teamSize; i++){
		if (this.team[i].NAME == player) return this.team[i];
	}
	console.log("Player not found");
	return "NULL";
}

Team.prototype.getIndex = function(player){
	console.log(player);
	for (var i = 0; i < this.teamSize; i++){
		if (this.team[i].NAME == player){
			return i;
		}
	}
	console.log("Player not found");
	return "NULL";
}
Team.prototype.swap = function(a, b){
	var temp_player = this.team[a];
	this.team[a] = this.team[b];
	this.team[b] = temp_player;
}

Team.prototype.order = function(){
	var swapped = true; 
	while (swapped){
		swapped = false;
		for (var i = 0; i < this.teamSize-1; i++){
			var metric1 = 0;
			var metric2 = 0;
			for (var j = 0; j < arguments.length; j++){
				metric1 += this.team[i].get(arguments[j]);
				metric2 += this.team[i+1].get(arguments[j]);
			}
			if (metric1 < metric2){
				this.swap(i, i+1);
				swapped = true;
			}
		}
	}
}


Team.prototype.swap = function(player, team){
	this.add(team.get(player));
	team.team.splice(team.getIndex(player), 1);
	team.teamSize--;
}

Team.prototype.getTotal = function(stat){
	var total = 0;
	for (var i = 0; i < this.team.length; i++){
		total += this.team[i].get(stat);
	}
	return total;
}


/*********
 TESTBENCH
 *********/
var waivers = new Team();

$.get('player.txt', function(data){
	var playerLine = data.split("\n");
	for (var i = 0; i < playerLine.length; i++){
		var playerStat = playerLine[i].split(/\t|,| |Breaking|Recent/g);
		var begin = playerStat.length - 10;
		var name = "";
		var index = 1;
		while (playerStat[index] != ""){
			name += playerStat[index] + " ";
			index++;
		}
		name = name.substring(0, name.length-1);
		waivers.add(parseFloat(playerStat[0]), name, playerStat[index+1], playerStat[index+2], parseFloat(playerStat[begin]), parseFloat(playerStat[begin+1]),  parseFloat(playerStat[begin+2]), parseFloat(playerStat[begin+3]), parseFloat(playerStat[begin+4]), parseFloat(playerStat[begin+5]), parseFloat(playerStat[begin+6]), parseFloat(playerStat[begin+7]), parseFloat(playerStat[begin+9]));
	}
}, 'text');

var userTeam = new Team();
var deletedTeam = new Team();
var stats = ["FG", "FT", "TPM", "REB", "AST", "STL", "BLK", "PTS"];
var positions = ["PG", "SG", "SF", "PF", "C"];

angular.module('fantasyPlayer', [])

.controller('FantasyController', ['$scope', 'orderByFilter', function($scope, orderBy){
	$scope.myTeam = userTeam.team;
	$scope.teamTotal = {FG: 0, FT: 0, TPM: 0, REB: 0, AST: 0, STL: 0, BLK: 0, PTS: 0, TOTAL: 0}
	$scope.tab = 1;
	$scope.showPos = {PG: true, SG: true, SF: true, PF: true, C: true};
	$scope.product = orderBy(waivers.team, $scope.orderStat, $scope.reverse);
	$scope.updateTotal = function(){
		for (var i = 0; i < stats.length; i++){
			$scope.teamTotal[stats[i]] = userTeam.getTotal(stats[i]);
		}
	}
}])

.controller('WaiverController', ['$scope', '$parse', 'orderByFilter', function($scope, $parse, orderBy){
	$scope.allStats = stats;
	$scope.reverse = false;
	$scope.specStats = [];
	$scope.orderStat = "RANK";

	$scope.addToTeam = function(player, team){
		if (team == "user"){
			userTeam.swap(player, waivers);
			$scope.updateTotal();
			console.log($scope.teamTotal.FG);
		}	
		else if (team == "delete") deletedTeam.swap(player, waivers);
		else if (team == "waivers") waivers.swap(player, userTeam);	
		$scope.product = orderBy(waivers.team, $scope.orderStat, $scope.reverse);
	}

	$scope.sortBy = function(stat){
		$scope.reverse = ($scope.orderStat === stat) ? !$scope.reverse : true;
		var scope_vari = stat + "class";
		var model = $parse(scope_vari);
		if (jQuery.inArray(stat, $scope.specStats) < 0 && stat != "RANK"){
			$scope.specStats.push(stat);
			model.assign($scope, "selected");
		}
		else{
			$scope.specStats = jQuery.grep($scope.specStats, function(value){
				return value != stat;
			});
			model.assign($scope, "");
		}
		for (var i = 0; i < waivers.team.length; i++){
			var specStat = 0;
			for (var j = 0; j < $scope.specStats.length; j++){
				specStat += waivers.team[i].get($scope.specStats[j]);
			}
			waivers.team[i].SPEC = specStat;
		}
		if ($scope.specStats.length > 1){
			$scope.orderStat = "SPEC";
			$scope.reverse = true;
		}
		else if ($scope.specStats.length == 1) $scope.orderStat = $scope.specStats[0];
		else $scope.orderStat = "RANK";
		$scope.product = orderBy(waivers.team, $scope.orderStat, $scope.reverse);
	};
}])

.controller('TeamController', ['$scope', function($scope){
	$scope.stats = stats;
	$scope.addToTeam = function(player, team){
		if (team == "waivers") waivers.swap(player, userTeam);
		$scope.product = orderBy(waivers.team, $scope.orderStat, $scope.reverse);	
	}
}]);
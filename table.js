function Table(tableID) {
	this.id = tableID;
	this.status = "available";
	this.players = [];
	this.pack = [];
	this.rounds = 0;
	this.zhuangJia = "";
	this.ifZhuangJia = false;
	this.readyToPlayCounter = 0;
	this.minPlayerLimit = 2; //not needed at this moment
	this.maxPlayerLimit = 4;
	this.gameObj = null;
	this.finishedPlays = 0;
	this.xianToBeProcess = []
	this.cardsBuilded = 0; //number of 摆牌确认
	this.roundDrankCups = {} //display player's drinking for each round

};


Table.prototype.resetTable = function () {
	this.status = "available";
	this.rounds = 0;
	this.zhuangJia = "";
	this.ifZhuangJia = false;
	this.readyToPlayCounter = 0;
	this.cardsBuilded = 0;
	this.finishedPlays = 0;
	this.xianToBeProcess = []
}

Table.prototype.addToXianToBeProcess = function (xianID) {
	for (var i = 0; i < this.players.length; i++) {
		if (this.players[i].id === xianID) {
			this.xianToBeProcess.push(this.players[i])
		}
	}
}

Table.prototype.removeXianToBeProcess = function () {
	this.xianToBeProcess.splice(0, 1)
}

/*
Table.prototype.createNameArr= function (){
var nameArr=[]
for (var i=0;i<this.players.length;i++){
 nameArr.push(this.players[i].name)

}
return nameArr;
}
*/

Table.prototype.createNameArr = function (player) {
	var nameArr = [];
	for (var i = 0; i < this.players.length; i++) {
		if (this.players[i].id !== player.id) {
			nameArr.push(this.players[i].name)
		}
	}
	return nameArr;
}


//probably not necessary
Table.prototype.whoIsZhuang = function () {
	var zhuangJia = null;
	for (var i = 0; i < this.players.length; i++) {
		if (this.players[i].isZhuangJia === true) {
			zhuangJia = this.players[i]
			break;
			//this.zhuangJia=zhuangJia.name
		}
	}

	return zhuangJia;

}

Table.prototype.setName = function (name) {
	this.name = name
}

/*
Table.prototype.addPlayer = function(player) {
	if (this.status === "available") {
		var found = false;
		for(var i = 0; i < this.players.length; i++) {
			if(this.players[i].id == player.id){
				found = true;
				break;
			}
		}
		if(!found){
			this.players.push(player);
			if(this.players.length == this.maxPlayerLimit){
				//this.status = "playing";
				for(var i = 0; i < this.players.length; i++){
					this.players[i].status = "intable";
				}
			}
			return true;
		}
	}
	return false;
};
*/

Table.prototype.addPlayer = function (player) {

	if (this.players.length < this.maxPlayerLimit) {
		this.players.push(player);
	}
	if (this.players.length == this.maxPlayerLimit) {
		this.status = "unavailable";
		for (var i = 0; i < this.players.length; i++) {
			this.players[i].status = "intable";
		}
	}

};

Table.prototype.removePlayer = function (player) {
	var index = -1;
	for (var i = 0; i < this.players.length; i++) {
		if (this.players[i].id === player.id) {
			index = i;
			break;
		}
	}
	if (index != -1) {
		this.players.splice(index, 1);//might need review 
	}
};

Table.prototype.getAllXianJia = function () {
	var xianArr = this.players.slice()
	for (var i = 0; i < this.players.length; i++) {
		if (this.players[i].isZhuangJia === true) {
			xianArr.splice(i, 1)
		}
	}
	return xianArr
};

Table.prototype.updateRoundDrank = function (player, cups) {
	if (!this.roundDrankCups[player]) {
		this.roundDrankCups[player] = Number(cups)
	} else {
		this.roundDrankCups[player] = Number(this.roundDrankCups[player]) + Number(cups)
	}
}


Table.prototype.isTableAvailable = function () {
	if ((this.maxPlayerLimit > this.players.length) && (this.status === "available")) {
		return true;
	} else {
		return false;
	}
	//return (this.playerLimit > this.players.length);
};

module.exports = Table;

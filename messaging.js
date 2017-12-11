Game = require("./game.js");
Table = require('./table.js');


function Messaging() { };

Messaging.prototype.createSampleTables = function (amount) {
	var tableList = [];
	for (var i = 0; i < amount; i++) {
		var game = new Game();
		//var table = new Table(uuid.v4());
		var table = new Table(i + 1);
		table.setName("Test Table" + (i + 1));
		table.gameObj = game;
		table.pack = game.pack; //adds the shuffled pack from the constructor
		table.status = "available";
		tableList.push(table);
	}
	return tableList;
};

Messaging.prototype.sendEventToAllPlayers = function (event, message, io, players) {
	for (var i = 0; i < players.length; i++) {
		io.to(players[i].id).emit(event, message);
	}
};
Messaging.prototype.sendEventToAllNotPlaying = function (event, message, io, players) {
	for (var i = 0; i < players.length; i++) {
		if (players[i].status !== "intable") {
			io.to(players[i].id).emit(event, message);
		}
	}
};

Messaging.prototype.sendEventToAllPlayersButPlayer = function (event, message, io, players, player) {
	for (var i = 0; i < players.length; i++) {
		if (players[i].id != player.id) {
			io.to(players[i].id).emit(event, message);
		}
	}
};
Messaging.prototype.sendEventToAllPlayersButZhuangOrXian = function (event, message, io, players, zhuang, xian) {
	for (var i = 0; i < players.length; i++) {
		if (players[i].id != zhuang.id && players[i].id != xian.id) {
			io.to(players[i].id).emit(event, message);
		}
	}
};

Messaging.prototype.sendEventToAPlayer = function (event, message, io, players, player) {
	for (var i = 0; i < players.length; i++) {
		if (players[i].id == player.id) {
			io.to(players[i].id).emit(event, message);
		}
	}
};

Messaging.prototype.sendEventToZhuangJia = function (event, io, players, player) {
	for (var i = 0; i < players.length; i++) {
		if (players[i].id == player.id) {
			io.to(players[i].id).emit(event);
		}
	}
};


module.exports = Messaging;

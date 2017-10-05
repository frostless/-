function Room(name) {  
    this.players = [];
    this.tables = [];
    this.name = name;
};

Room.prototype.addPlayer = function(player) {  
    this.players.push(player);
};

Room.prototype.isDuplicate = function (name){
	var duplicate = false;
	if (this.players.length>0) {
	  for (var i = 0; i < this.players.length; i++){
	  	 if (this.players[i].name===name){
	  	 	duplicate = true;
	  	  } 
	   }
	 }
	 
	 return duplicate;
}


Room.prototype.removePlayer = function(player) {
	var playerIndex = -1;
	for(var i = 0; i < this.players.length; i++){
		if(this.players[i].id == player.id){
			playerIndex = i;
			break;
		}
	}
	if(playerIndex!= -1){
		this.players.splice(playerIndex,1);//might need review 
	}
};

Room.prototype.removeTable = function(table) {
	var tableIndex = -1;
	for(var i = 0; i < this.tables.length; i++){
		if(this.tables[i].id == table.id){
			tableIndex = i;
			break;
		}
	}
	if(tableIndex!= -1){
		this.tables.splice(tableIndex,1);//might need review 
	}
};

Room.prototype.addTable = function(table) {  
    this.tables.push(table);
};

Room.prototype.getPlayer = function(playerId) {
	var player = null;
	for(var i = 0; i < this.players.length; i++) {
		if(this.players[i].id == playerId) {
			player = this.players[i];
			break;
		}
	}
	return player;
};

Room.prototype.getTable = function(tableId) {
	var table = null;
	for(var i = 0; i < this.tables.length; i++){
		if(this.tables[i].id == tableId){
			table = this.tables[i];
			break;
		}
	}
	return table;
};

module.exports = Room;
function Player(playerID) {  
    this.id = playerID;
    this.name = "";
    this.tableID = "";
    this.rounds=0;
    this.hand = [];
    this.isZhuangJia=false
    this.wins=0
    this.move = ""
    this.isCardsShown=false
    this.loss=0
    this.drankCups=0
    this.cardStatus={}
    this.status = "";
   
};

Player.prototype.setName = function (name){
	this.name=name
}
Player.prototype.resetPlayer = function (){
    this.rounds=0;
    this.hand = [];
    this.isZhuangJia=false
    this.wins=0
    this.gaiPai=false;
    this.isCardsShown=false
    this.loss=0
    this.drankCups=0
    this.cardStatus={}
}

module.exports = Player;
function Game() {
  this.pack = this._shufflePack(this._createPack());
}

Game.prototype._createPack = function () {
  var suits = new Array(".1", ".2", ".3", ".4");
  var pack = new Array();
  var n = 54;
  //var index = n / suits.length;
  var count = 0;
  for (i = 0; i <= 3; i++)
    for (j = 1; j <= 14; j++)
      pack[count++] = j + suits[i];
  pack.sort(function (a, b) { return a - b });
  pack.splice(-2, 2)
  return pack;
}

Game.prototype._shufflePack = function (pack) {
  var i = pack.length, j, tempi, tempj;
  if (i === 0) return false;
  while (--i) {
    j = Math.floor(Math.random() * (i + 1));
    tempi = pack[i];
    tempj = pack[j];
    pack[i] = tempj;
    pack[j] = tempi;
  }
  return pack;
}

Game.prototype.drawCard = function (pack, amount, hand, initial) {
  var cards = new Array();
  cards = pack.slice(0, amount);

  pack.splice(0, amount);

  if (!initial) {
    hand.push.apply(hand, cards);
    //hand.concat(hand);
  }

  return cards;
}

module.exports = Game;

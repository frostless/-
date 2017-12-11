module.exports = {
  checkIfCheating: function (ori, fin) {
    var ifCheating = false
    ori = ori.map(Number).sort(function (a, b) { return b - a });
    fin = fin.map(Number).sort(function (a, b) { return b - a });
    var newOri = ori.slice()
    if (ori.length !== fin.length) {
      ifCheating = true
      return ifCheating
    }
    //ori[1] === 14.1||ori[1] === 14.2 shuiyu
    if (ori[1] === 14.1) {
      newOri.splice(0, 2)
      if (fin.indexOf(newOri[1]) === -1 || fin.indexOf(newOri[0]) === -1) {
        ifCheating = true
        return ifCheating
      }
    } else if (ori[1] !== 14.1 && Math.floor(ori[0]) === 14) {
      newOri.splice(0, 1)
      if (fin.indexOf(newOri[2]) === -1 || fin.indexOf(newOri[1]) === -1 || fin.indexOf(newOri[0]) === -1) {
        ifCheating = true
        return ifCheating
      }
    } else {
      if (fin.indexOf(ori[3]) === -1 || fin.indexOf(ori[2]) === -1 || fin.indexOf(ori[1]) === -1 || fin.indexOf(ori[0]) === -1) {
        ifCheating = true
      }
    }

    return ifCheating
  }

}

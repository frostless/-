var Game = require('./game.js');
var Player = require("./player.js");
var Room = require('./room.js');
var Table = require('./table.js');
var Messaging = require('./messaging.js');
var checkWin = require('./checkWin.js');
var checkIfCheating = require('./checkIfCheating.js');

var mongojs = require("mongojs");
var db = mongojs('localhost:27017/test', ['user', 'status', 'opponents', 'level']);

var express = require('express');
var server = express();
var serv = require('http').Server(server);
var io = require('socket.io')(serv, {});

server.use('/js', express.static(__dirname + '/client/js'));
server.use('/css', express.static(__dirname + '/client/css'));
server.use('/poker', express.static(__dirname + '/client/poker'));
server.use('/sounds', express.static(__dirname + '/client/sounds'));

server.get('/', function (req, res) {
    res.sendFile(__dirname + '/client/index.html');
});


serv.listen(8000);
console.log("Server started.");

var messaging = new Messaging();
var room = new Room("水鱼大厅");
room.tables = messaging.createSampleTables(9);
var timer;

var isUsernameTaken = function (data, cb) {
    db.user.find({ "username": data }, function (err, res) {
        if (res.length > 0)
            cb(true);
        else
            cb(false);
    });
}

var isValidPassword = function (data, cb) {
    db.user.find({ "username": data.username, "password": data.password }, function (err, res) {
        if (res.length > 0)
            cb(true);
        else
            cb(false);
    });
}
function sortObject(obj, uName) {
    var arr = [];
    var prop;
    for (prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            arr.push({
                'key': prop,
                'value': obj[prop]
            });
        }
    }
    arr.sort(function (a, b) {
        return b.value - a.value;
    });
    arr.unshift({ username: uName })
    return arr; // returns array
}

io.sockets.on('connection', function (client) {

    client.on('signUp', function (data) {
        isUsernameTaken(data.username, function (res) {
            if (res) {
                client.emit('signUpResponse', { success: false });
            } else {
                var player = new Player(client.id)
                player.setName(data.username)
                room.addPlayer(player)
                db.user.insert({ "username": data.username, "password": data.password })
                db.status.insert({ "username": data.username, "rounds": 0, "wins": 0, "loss": 0, "drank": 0, "zhuang": 0, "xian": 0, "shuiyu": 0, "points": 0, "mostPlayed": "这家伙第一次玩游戏", "playedTimes": 0, "level": "level1" });//update status
                db.opponents.insert({ "username": data.username, [data.username]: {} });//update oppo
                db.level.update({ level: "level1" }, { $addToSet: { users: data.username } });//update level
                client.emit('signUpResponse', { username: data.username, success: true, points: 0 });
                io.emit("logging", { message: "新玩家 " + data.username + " 进入了水鱼大厅." });
            }
        });
        setInterval(function () {
            var arr = []
            for (var i = 0; i < room.tables.length; i++) {
                var num = room.tables[i].players.length
                if (!num) {
                    num = 0
                }
                arr.push(num)
            }
            messaging.sendEventToAllPlayers('displayVacancies', { number: arr }, io, room.players);
        }, 5000);
    })

    client.on('signIn', function (data) {

        isValidPassword(data, function (res) {
            if (res && !room.isDuplicate(data.username)) {
                var player = new Player(client.id)
                player.setName(data.username)
                room.addPlayer(player)
                db.status.find({ "username": data.username }, { "_id": 0, "points": 1 }, function (err, res) {
                    res.map(function (val) {
                        client.emit('signInResponse', { username: data.username, success: true, points: val.points });
                        db.level.update({ level: val.level }, { $pull: { users: data.username } })
                        if (val.points < 20) {
                            db.status.update({ username: data.username }, { $set: { level: "level1" } })
                            db.level.update({ level: "level1" }, { $addToSet: { users: data.username } })
                        } else if (val.points < 40) {
                            db.status.update({ username: data.username }, { $set: { level: "level2" } })
                            db.level.update({ level: "level2" }, { $addToSet: { users: data.username } })
                        } else if (val.points < 60) {
                            db.status.update({ username: data.username }, { $set: { level: "level3" } })
                            db.level.update({ level: "level3" }, { $addToSet: { users: data.username } })
                        } else if (val.points < 80) {
                            db.status.update({ username: data.username }, { $set: { level: "level4" } })
                            db.level.update({ level: "level4" }, { $addToSet: { users: data.username } })
                        } else if (val.points < 100) {
                            db.status.update({ username: data.username }, { $set: { level: "level5" } })
                            db.level.update({ level: "level5" }, { $addToSet: { users: data.username } })
                        } else {
                            db.status.update({ username: data.username }, { $set: { level: "level6" } })
                            db.level.update({ level: "level6" }, { $addToSet: { users: data.username } })
                        }
                    });
                });
                io.emit("logging", { message: data.username + " 进入了水鱼大厅." });
            } else {
                client.emit('signInResponse', { success: false });
            }
        });
        setInterval(function () {
            var arr = []
            for (var i = 0; i < room.tables.length; i++) {
                var num = room.tables[i].players.length
                if (!num) {
                    num = 0
                }
                arr.push(num)
            }
            messaging.sendEventToAllPlayers('displayVacancies', { number: arr }, io, room.players);
        }, 5000);
    })

    client.on('connectToTable', function (data) {
        var player = room.getPlayer(client.id);
        var table = room.getTable(data.tableID);
        table.setName(data.tableName)
        table.maxPlayerLimit = Number(data.limit)

        if (table.isTableAvailable()) {
            if (player.tableID) {
                var oldTable = room.getTable(player.tableID); //need to remove player from old if they swich
                oldTable.removePlayer(player); //remove player if they come from other tables
            }
            table.addPlayer(player)
            player.tableID = table.id;//might need total reset
            player.status = "intable";

            messaging.sendEventToAllPlayers('logging', { message: player.name + "在" + table.name + "." }, io, table.players)

            if (table.players.length < table.maxPlayerLimit) {
                client.emit('clearError')
                messaging.sendEventToAllPlayers('logging', { message: "当前" + table.name + "只有" + table.players.length + "名玩家，至少需要" + table.maxPlayerLimit + "名玩家才能开始游戏。" }, io, table.players)
            } else if (table.players.length == table.maxPlayerLimit) {
                table.status = "unavailable"; //needs to look at 
                messaging.sendEventToAllPlayers('logging', { message: "当前" + table.name + "有" + table.players.length + "名玩家，游戏马上开始。" }, io, table.players)
                //emit counter
                var countdown = 6; //3 seconds in reality...
                timer = setInterval(function () {
                    countdown--;
                    messaging.sendEventToAllPlayers('newRound', { countdown: countdown, display: true }, io, table.players);
                }, 1000);

            }
        } else {
            client.emit('tableFull')
            messaging.sendEventToAllPlayers('logging', { message: player.name + "试图加入" + table.name + "，但由于本桌人数已满请求被拒绝。" }, io, table.players)
            console.log("for whatever reason player can't be added to table."); //needs looking at
        }

    });

    //determin zhuangJia status
    client.on('zhuangJia', function () {
        var zhuangJia = room.getPlayer(client.id);
        var table = room.getTable(zhuangJia.tableID);
        //only one player can be zhuangJia
        if (!table.ifZhuangJia) {
            zhuangJia.isZhuangJia = true;
            table.ifZhuangJia = true;
            table.zhuangJia = zhuangJia;
            setTimeout(function () { client.emit('logging', { message: "你是庄家" }) }, 1500);
            //setTimeout(function(){ client.emit('zhuangJiaBuildCards')}, 1500);
            setTimeout(function () { messaging.sendEventToAllPlayersButPlayer('logging', { message: "你是闲家，" + zhuangJia.name + "是庄家" }, io, table.players, zhuangJia) }, 1500);
            messaging.sendEventToAllPlayers('preventDupliZhuang', "", io, table.players)
        }
    });

    client.on("readyToPlay", function () {
        console.log("Ready to play called");
        clearInterval(timer)
        var player = room.getPlayer(client.id);
        var table = room.getTable(player.tableID);
        table.roundDrankCups = {}; //reset each round's drankCups status
        client.emit('ranking', { ranking: table.players })

        table.readyToPlayCounter++; //very good then only the last socket would fire event,review!

        if (table.readyToPlayCounter === table.maxPlayerLimit) {
            table.pack = table.gameObj._shufflePack(table.gameObj._createPack());
            for (var i = 0; i < table.players.length; i++) {
                table.players[i].hand = table.gameObj.drawCard(table.pack, 4, "", 1);
                // table.gameObj.drawCard(table.pack, 4, "", 1);
                //need to add laizi = true to secure
                io.to(table.players[i].id).emit('originalHand', { hand: table.players[i].hand });
                io.to(table.players[i].id).emit('displayNames', { names: table.createNameArr(table.players[i]), zhuangName: table.whoIsZhuang().name });
            }
        }

        if (table.ifZhuangJia === false) {
            var randomNumber = Math.floor(Math.random() * table.players.length);

            var zhuangJia = table.players[randomNumber]
            zhuangJia.isZhuangJia = true;
            table.ifZhuangJia = true;
            table.zhuangJia = zhuangJia
            io.to(zhuangJia.id).emit('logging', { message: "你是庄家" });

            messaging.sendEventToAllPlayersButPlayer('logging', { message: "你是闲家，系统随机选取" + zhuangJia.name + "为庄家" }, io, table.players, zhuangJia)

        }

        client.emit('logging', { message: "牌已发出，请摆牌" });

        console.log(table.pack.length)

        table.players.forEach(function (name) {
            db.opponents.find({ username: name.name }, { username: 0, _id: 0 }, function (err, res) {
                if ((sortObject(res[0][name.name], name.name))[1]) {
                    db.status.update({ username: name.name }, { $set: { mostPlayed: (sortObject(res[0][name.name], name.name))[1].key, playedTimes: (sortObject(res[0][name.name], name.name))[1].value } })
                }
            })
            db.status.find({ "username": name.name }, { "_id": 0 }, function (err, res) {
                res.map(function (val) {
                    client.emit('statusData', val)
                })
            })
        })

    })


    client.on('finalHand', function (data) {

        var player = room.getPlayer(client.id); //not necessarilly zhuang or xian
        var table = room.getTable(player.tableID);
        table.cardsBuilded++
        table.readyToPlayCounter = 0;//needs to review
        var zhuangJia = table.whoIsZhuang()

        if (checkIfCheating.checkIfCheating(player.hand, data) === false) {
            player.hand = data;  //checks if cheating
        } else {
            messaging.sendEventToAllPlayers('logging', { message: "系统抓到并阻止了" + player.name + "作弊换牌，他将以原始牌面继续游戏" }, io, table.players)
        }

        player.cardStatus = checkWin.checkCardStatus(player.hand)

        client.emit('logging', { message: "你已成功摆牌" })
        messaging.sendEventToAllPlayersButPlayer('logging', { message: player.name + "摆牌确定" }, io, table.players, player)

        if (player.cardStatus.status === "zhaDan" || player.cardStatus.status === "shuiYu") {
            messaging.sendEventToAllPlayersButPlayer('unCoverCards', { cards: player.hand, playerName: player.name }, io, table.players, player)
            messaging.sendEventToAllPlayersButPlayer('logging', { message: player.name + "拿到了水鱼或炸弹，自动开牌，等待比大小" }, io, table.players, player)
        }

        if (table.cardsBuilded === table.players.length) {
            table.cardsBuilded = 0; //reset
            if (zhuangJia.cardStatus.status === "zhaDan" || zhuangJia.cardStatus.status === "shuiYu") {
                zhuangJia.move = "zhuangShuiZha"
                db.status.update({ username: zhuangJia.name }, { $inc: { shuiyu: 1 } })
                table.xianToBeProcess = table.getAllXianJia()
            } else {
                zhuangJia.move = ""
                var allXianJia = table.getAllXianJia()
                for (var i = 0; i < allXianJia.length; i++) {
                    if (allXianJia[i].cardStatus.status === "zhaDan" || allXianJia[i].cardStatus.status === "shuiYu") {
                        table.addToXianToBeProcess(allXianJia[i].id)
                        allXianJia[i].move = "shuiZha"
                    } else {
                        io.to(allXianJia[i].id).emit('xianTurn')
                    }
                }
            }
        }

        if (table.xianToBeProcess.length === table.players.length - 1) {
            var firstXian = table.xianToBeProcess[0]
            if (zhuangJia.move === "zhuangShuiZha") {
                io.to(zhuangJia.id).emit('zhuangConfirmationForZhuangShuiZha', { xianJia: firstXian.name })
                io.to(firstXian.id).emit('xianConfirmationForZhuangShuiZha', { zhuangJia: zhuangJia.name })
            } else {
                io.to(zhuangJia.id).emit('zhuangConfirmationForXianShuiZha', { xianJia: firstXian.name })
                io.to(firstXian.id).emit('xianConfirmationForXianShuiZha', { zhuangJia: zhuangJia.name })
            }
        }

    })

    client.on('xianCoverCard', function () {
        var xianJia = room.getPlayer(client.id);
        xianJia.move = "gaiPai"
        var table = room.getTable(xianJia.tableID);
        var zhuangJia = table.whoIsZhuang()
        table.addToXianToBeProcess(client.id)//add xianJia to to-be-processed list
        //var coverCardsXianPlayerID=client.id not necessary

        io.to(xianJia.id).emit('logging', { message: "盖牌成功，等待庄家决定" })
        //send message to players but sender and zhuangJia
        messaging.sendEventToAllPlayersButZhuangOrXian('logging', { message: xianJia.name + "盖牌，牌好像很好哦" }, io, table.players, zhuangJia, xianJia)
        io.to(zhuangJia.id).emit('logging', { message: xianJia.name + "盖牌，请选择认输或者杀" })
        // io.to(zhuangJia.id).emit('zhuangDecisionForXianCover',{xianJia:xianJia.name});

        if (table.xianToBeProcess.length === table.players.length - 1) {
            var firstXian = table.xianToBeProcess[0];
            if (firstXian.move === "gaiPai") {
                io.to(zhuangJia.id).emit('zhuangDecisionForXianCover', { xianJia: firstXian.name })
            } else if (firstXian.move === "kaiPai") {
                io.to(zhuangJia.id).emit('zhuangDecisionForXianUnCover', { xianJia: firstXian.name })
            } else if (firstXian.move === "qiangGong") {
                io.to(zhuangJia.id).emit('zhuangDecisionForXianQiangGong', { xianJia: firstXian.name })
            } else if (firstXian.move === "shuiZha") {
                io.to(zhuangJia.id).emit('zhuangConfirmationForXianShuiZha', { xianJia: firstXian.name })
                io.to(firstXian.id).emit('xianConfirmationForXianShuiZha', { zhuangJia: zhuangJia.name })
            }
        }

    })

    client.on('xianCoverCardsZhuangRenShu', function () {
        var zhuangJia = room.getPlayer(client.id);
        var table = room.getTable(zhuangJia.tableID);
        var xianJia = table.xianToBeProcess[0]
        xianJia.rounds++
        xianJia.wins++

        zhuangJia.loss++
        zhuangJia.drankCups = Number(zhuangJia.drankCups) + 0.5

        table.removeXianToBeProcess()
        table.finishedPlays++
        table.updateRoundDrank(zhuangJia.name, 0.5)//update each round drinking
        table.updateRoundDrank(xianJia.name, 0)
        messaging.sendEventToAllPlayersButZhuangOrXian('logging', { message: zhuangJia.name + "和" + xianJia.name + "游戏结果:" + xianJia.name + "盖牌，庄家" + zhuangJia.name + "屎黑认输喝半杯" }, io, table.players, zhuangJia, xianJia)
        io.to(xianJia.id).emit('logging', { message: "庄家" + zhuangJia.name + "认输喝半杯，你赢了" })
        io.to(zhuangJia.id).emit('logging', { message: "你屎黑盖牌认输要喝半杯" })

        // table.rounds++ because not all players finish there turns

        //check if round is finished,needs countdown

        if (table.xianToBeProcess.length >= 1) {
            var firstXian = table.xianToBeProcess[0];
            if (firstXian.move === "gaiPai") {
                setTimeout(function () { io.to(zhuangJia.id).emit('zhuangDecisionForXianCover', { xianJia: firstXian.name }); }, 800);
            } else if (firstXian.move === "kaiPai") {
                setTimeout(function () { io.to(zhuangJia.id).emit('zhuangDecisionForXianUnCover', { xianJia: firstXian.name }); }, 800);
            } else if (firstXian.move === "qiangGong") {
                setTimeout(function () { io.to(zhuangJia.id).emit('zhuangDecisionForXianQiangGong', { xianJia: firstXian.name }); }, 800);
            }
        }


        if (table.finishedPlays === table.players.length - 1) {
            table.rounds++
            zhuangJia.rounds++
            table.finishedPlays = 0;//reset
            messaging.sendEventToAllPlayers('drankCupsDisplay', { drankCups: table.roundDrankCups }, io, table.players)
            var countdown = 6; //3 seconds in reality...
            timer = setInterval(function () {
                countdown--;
                messaging.sendEventToAllPlayers('newRound', { countdown: countdown, display: false }, io, table.players);
            }, 1000);
        }

    })

    client.on('xianCoverCardsZhuangSha', function () {
        var zhuangJia = room.getPlayer(client.id);
        var table = room.getTable(zhuangJia.tableID);
        var xianJia = table.xianToBeProcess[0]
        xianJia.rounds++
        table.removeXianToBeProcess()
        table.finishedPlays++
        var result = checkWin.zhuangWinOneSide(zhuangJia.cardStatus, xianJia.cardStatus, zhuangJia.name, xianJia.name)
        checkWin.updateGameStaus(zhuangJia, xianJia, result)
        table.updateRoundDrank(zhuangJia.name, result.zhuangDrankCups)
        table.updateRoundDrank(xianJia.name, result.xianDrankCups)

        messaging.sendEventToAllPlayersButZhuangOrXian('logging', { message: zhuangJia.name + "和" + xianJia.name + "游戏结果:" + result.comment }, io, table.players, zhuangJia, xianJia)
        io.to(xianJia.id).emit('logging', { message: result.commentToXian })
        io.to(zhuangJia.id).emit('logging', { message: result.commentToZhuang })

        io.to(zhuangJia.id).emit('unCoverCards', { cards: xianJia.hand, playerName: xianJia.name })

        io.to(xianJia.id).emit('unCoverCards', { cards: zhuangJia.hand, playerName: zhuangJia.name })


        if (table.xianToBeProcess.length >= 1) {
            var firstXian = table.xianToBeProcess[0];
            if (firstXian.move === "gaiPai") {
                setTimeout(function () { io.to(zhuangJia.id).emit('zhuangDecisionForXianCover', { xianJia: firstXian.name }); }, 800);
            } else if (firstXian.move === "kaiPai") {
                setTimeout(function () { io.to(zhuangJia.id).emit('zhuangDecisionForXianUnCover', { xianJia: firstXian.name }); }, 800);
            } else if (firstXian.move === "qiangGong") {
                setTimeout(function () { io.to(zhuangJia.id).emit('zhuangDecisionForXianQiangGong', { xianJia: firstXian.name }); }, 800);
            }
        }


        if (table.finishedPlays === table.players.length - 1) {
            table.rounds++
            zhuangJia.rounds++
            table.finishedPlays = 0;//reset
            messaging.sendEventToAllPlayers('drankCupsDisplay', { drankCups: table.roundDrankCups }, io, table.players)
            var countdown = 6; //3 seconds in reality...
            timer = setInterval(function () {
                countdown--;
                messaging.sendEventToAllPlayers('newRound', { countdown: countdown, display: false }, io, table.players);
            }, 1000);
        }

    })

    client.on('xianQiangGong', function () {
        var xianJia = room.getPlayer(client.id);
        xianJia.move = "qiangGong"
        var table = room.getTable(xianJia.tableID);
        var zhuangJia = table.whoIsZhuang()
        table.addToXianToBeProcess(client.id)//add xianJia to to-be-processed list
        // need to sent uncover card halfly to zhuang
        io.to(xianJia.id).emit('logging', { message: "你强攻，等待庄家决定" })
        messaging.sendEventToAllPlayersButPlayer('qiangGongShowCards', { cards: xianJia.hand, playerName: xianJia.name }, io, table.players, xianJia)
        //send message to players but sender and zhuangJia
        messaging.sendEventToAllPlayersButZhuangOrXian('logging', { message: xianJia.name + "强攻，牌应该是真真不错的了" }, io, table.players, zhuangJia, xianJia)
        io.to(zhuangJia.id).emit('logging', { message: xianJia.name + "强攻，请选择认输或者杀" })

        if (table.xianToBeProcess.length === table.players.length - 1) {
            var firstXian = table.xianToBeProcess[0];
            if (firstXian.move === "gaiPai") {
                io.to(zhuangJia.id).emit('zhuangDecisionForXianCover', { xianJia: firstXian.name })
            } else if (firstXian.move === "kaiPai") {
                io.to(zhuangJia.id).emit('zhuangDecisionForXianUnCover', { xianJia: firstXian.name })
            } else if (firstXian.move === "qiangGong") {
                io.to(zhuangJia.id).emit('zhuangDecisionForXianQiangGong', { xianJia: firstXian.name })
            } else if (firstXian.move === "shuiZha") {
                io.to(zhuangJia.id).emit('zhuangConfirmationForXianShuiZha', { xianJia: firstXian.name })
                io.to(firstXian.id).emit('xianConfirmationForXianShuiZha', { zhuangJia: zhuangJia.name })
            }
        }

    })



    client.on('XianQiangGongZhuangRenShu', function () {
        var zhuangJia = room.getPlayer(client.id);
        var table = room.getTable(zhuangJia.tableID);
        var xianJia = table.xianToBeProcess[0]
        xianJia.rounds++
        xianJia.wins++

        zhuangJia.loss++
        zhuangJia.drankCups = Number(zhuangJia.drankCups) + 1

        table.removeXianToBeProcess()
        table.finishedPlays++
        table.updateRoundDrank(zhuangJia.name, 1)//update each round drinking
        table.updateRoundDrank(xianJia.name, 0)
        messaging.sendEventToAllPlayersButZhuangOrXian('logging', { message: zhuangJia.name + "和" + xianJia.name + "游戏结果:" + xianJia.name + "强攻，庄家" + zhuangJia.name + "屎黑认输喝一杯" }, io, table.players, zhuangJia, xianJia)
        io.to(xianJia.id).emit('logging', { message: "庄家" + zhuangJia.name + "认输喝一杯，你赢了" })
        io.to(zhuangJia.id).emit('logging', { message: "你屎黑强攻认输要喝一杯" })

        // table.rounds++ because not all players finish there turns

        //check if round is finished,needs countdown

        if (table.xianToBeProcess.length >= 1) {
            var firstXian = table.xianToBeProcess[0];
            if (firstXian.move === "gaiPai") {
                setTimeout(function () { io.to(zhuangJia.id).emit('zhuangDecisionForXianCover', { xianJia: firstXian.name }); }, 800);
            } else if (firstXian.move === "kaiPai") {
                setTimeout(function () { io.to(zhuangJia.id).emit('zhuangDecisionForXianUnCover', { xianJia: firstXian.name }); }, 800);
            } else if (firstXian.move === "qiangGong") {
                setTimeout(function () { io.to(zhuangJia.id).emit('zhuangDecisionForXianQiangGong', { xianJia: firstXian.name }); }, 800);
            }
        }


        if (table.finishedPlays === table.players.length - 1) {
            table.rounds++
            zhuangJia.rounds++
            table.finishedPlays = 0;//reset
            messaging.sendEventToAllPlayers('drankCupsDisplay', { drankCups: table.roundDrankCups }, io, table.players)
            var countdown = 6; //3 seconds in reality...
            timer = setInterval(function () {
                countdown--;
                messaging.sendEventToAllPlayers('newRound', { countdown: countdown, display: false }, io, table.players);
            }, 1000);
        }

    })



    client.on('xianQiangGongZhuangSha', function () {
        var zhuangJia = room.getPlayer(client.id);
        var table = room.getTable(zhuangJia.tableID);
        var xianJia = table.xianToBeProcess[0]
        xianJia.rounds++
        table.removeXianToBeProcess()
        table.finishedPlays++
        var result = checkWin.xianQiangGong(zhuangJia.cardStatus, xianJia.cardStatus, zhuangJia.name, xianJia.name)
        checkWin.updateGameStaus(zhuangJia, xianJia, result)
        table.updateRoundDrank(zhuangJia.name, result.zhuangDrankCups)//update each round d
        table.updateRoundDrank(xianJia.name, result.xianDrankCups)
        messaging.sendEventToAllPlayersButZhuangOrXian('logging', { message: zhuangJia.name + "和" + xianJia.name + "游戏结果:" + result.comment }, io, table.players, zhuangJia, xianJia)
        io.to(xianJia.id).emit('logging', { message: result.commentToXian })
        io.to(zhuangJia.id).emit('logging', { message: result.commentToZhuang })

        io.to(zhuangJia.id).emit('unCoverCards', { cards: xianJia.hand, playerName: xianJia.name })

        io.to(xianJia.id).emit('unCoverCards', { cards: zhuangJia.hand, playerName: zhuangJia.name })


        if (table.xianToBeProcess.length >= 1) {
            var firstXian = table.xianToBeProcess[0];
            if (firstXian.move === "gaiPai") {
                setTimeout(function () { io.to(zhuangJia.id).emit('zhuangDecisionForXianCover', { xianJia: firstXian.name }); }, 800);
            } else if (firstXian.move === "kaiPai") {
                setTimeout(function () { io.to(zhuangJia.id).emit('zhuangDecisionForXianUnCover', { xianJia: firstXian.name }); }, 800);
            } else if (firstXian.move === "qiangGong") {
                setTimeout(function () { io.to(zhuangJia.id).emit('zhuangDecisionForXianQiangGong', { xianJia: firstXian.name }); }, 800);
            }
        }

        if (table.finishedPlays === table.players.length - 1) {
            table.rounds++
            zhuangJia.rounds++
            table.finishedPlays = 0;//reset
            messaging.sendEventToAllPlayers('drankCupsDisplay', { drankCups: table.roundDrankCups }, io, table.players)
            var countdown = 6; //3 seconds in reality...
            timer = setInterval(function () {
                countdown--;
                messaging.sendEventToAllPlayers('newRound', { countdown: countdown, display: false }, io, table.players);
            }, 1000);
        }

    })


    client.on('xianShuiZhaCheckWin', function () {
        var zhuangJia = room.getPlayer(client.id);
        var table = room.getTable(zhuangJia.tableID);
        var xianJia = table.xianToBeProcess[0]
        if (xianJia.cardStatus.status === "zhaDan" || xianJia.cardStatus.status === "shuiYu") {
            db.status.update({ username: xianJia.name }, { $inc: { shuiyu: 1 } })
        }
        xianJia.rounds++
        table.removeXianToBeProcess()
        table.finishedPlays++
        var result = checkWin.xianWinOneSide(zhuangJia.cardStatus, xianJia.cardStatus, zhuangJia.name, xianJia.name)
        checkWin.updateGameStaus(zhuangJia, xianJia, result)
        table.updateRoundDrank(zhuangJia.name, result.zhuangDrankCups)//update each round d
        table.updateRoundDrank(xianJia.name, result.xianDrankCups)
        messaging.sendEventToAllPlayersButZhuangOrXian('logging', { message: zhuangJia.name + "和" + xianJia.name + "游戏结果:" + result.comment }, io, table.players, zhuangJia, xianJia)
        io.to(xianJia.id).emit('logging', { message: result.commentToXian })
        io.to(zhuangJia.id).emit('logging', { message: result.commentToZhuang })
        io.to(xianJia.id).emit('unCoverCards', { cards: zhuangJia.hand, playerName: zhuangJia.name })
        io.to(zhuangJia.id).emit('unCoverCards', { cards: xianJia.hand, playerName: xianJia.name })

        if (table.xianToBeProcess.length >= 1) {
            var firstXian = table.xianToBeProcess[0];
            if (zhuangJia.move === "zhuangShuiZha") {
                setTimeout(function () { io.to(zhuangJia.id).emit('zhuangConfirmationForZhuangShuiZha', { xianJia: firstXian.name }); }, 800);
                setTimeout(function () { io.to(firstXian.id).emit('xianConfirmationForZhuangShuiZha', { zhuangJia: zhuangJia.name }); }, 800);
            } else if (firstXian.move === "gaiPai") {
                setTimeout(function () { io.to(zhuangJia.id).emit('zhuangDecisionForXianCover', { xianJia: firstXian.name }); }, 800);
            } else if (firstXian.move === "kaiPai") {
                setTimeout(function () { io.to(zhuangJia.id).emit('zhuangDecisionForXianUnCover', { xianJia: firstXian.name }); }, 800);
            } else if (firstXian.move === "qiangGong") {
                setTimeout(function () { io.to(zhuangJia.id).emit('zhuangDecisionForXianQiangGong', { xianJia: firstXian.name }); }, 800);
            } else if (firstXian.move === "shuiZha") {
                setTimeout(function () { io.to(zhuangJia.id).emit('zhuangConfirmationForXianShuiZha', { xianJia: firstXian.name }); }, 800);
                setTimeout(function () { io.to(firstXian.id).emit('xianConfirmationForXianShuiZha', { zhuangJia: zhuangJia.name }); }, 800);
            }
        }

        if (table.finishedPlays === table.players.length - 1) {
            table.rounds++
            zhuangJia.rounds++
            table.finishedPlays = 0;//reset
            messaging.sendEventToAllPlayers('drankCupsDisplay', { drankCups: table.roundDrankCups }, io, table.players)
            var countdown = 6; //3 seconds in reality...
            timer = setInterval(function () {
                countdown--;
                messaging.sendEventToAllPlayers('newRound', { countdown: countdown, display: false }, io, table.players);
            }, 1000);
        }


    })


    client.on('xianUnCoverCard', function () {
        var xianJia = room.getPlayer(client.id);
        xianJia.move = "kaiPai";
        var table = room.getTable(xianJia.tableID);
        var zhuangJia = table.whoIsZhuang()
        table.addToXianToBeProcess(client.id)//add xianJia to to-be-processed list

        io.to(xianJia.id).emit('logging', { message: "摆牌确定，等待庄家决定" })
        //send message to players but sender and zhuangJia
        messaging.sendEventToAllPlayersButZhuangOrXian('logging', { message: xianJia.name + "开牌，好像很保守哦" }, io, table.players, zhuangJia, xianJia)
        io.to(zhuangJia.id).emit('logging', { message: xianJia.name + "开牌，请决定走水或者杀" })
        //show zhuangJia cards

        messaging.sendEventToAllPlayers('unCoverCards', { cards: xianJia.hand, playerName: xianJia.name }, io, table.players)
        //io.emit('unCoverCards',{cards:xianJia.hand,playerName:xianJia.name})

        //give some time for zhuangjia to respond,needs review
        // setTimeout(function(){ io.to(zhuangJia.id).emit('zhuangDecisionForXianUnCover',{xianJia:xianJia.name}); }, 5000);

        if (table.xianToBeProcess.length === table.players.length - 1) {
            var firstXian = table.xianToBeProcess[0];
            if (firstXian.move === "gaiPai") {
                io.to(zhuangJia.id).emit('zhuangDecisionForXianCover', { xianJia: firstXian.name })
            } else if (firstXian.move === "kaiPai") {
                io.to(zhuangJia.id).emit('zhuangDecisionForXianUnCover', { xianJia: firstXian.name })
            } else if (firstXian.move === "qiangGong") {
                io.to(zhuangJia.id).emit('zhuangDecisionForXianQiangGong', { xianJia: firstXian.name })
            } else if (firstXian.move === "shuiZha") {
                io.to(zhuangJia.id).emit('zhuangConfirmationForXianShuiZha', { xianJia: firstXian.name })
                io.to(firstXian.id).emit('xianConfirmationForXianShuiZha', { zhuangJia: zhuangJia.name })
            }
        }

    })

    client.on('XianUnCoverCardsZhuangSha', function () {
        var zhuangJia = room.getPlayer(client.id);
        var table = room.getTable(zhuangJia.tableID);
        var xianJia = table.xianToBeProcess[0]
        io.to(xianJia.id).emit('logging', { message: "庄家" + zhuangJia.name + "要杀，你怎么看" })
        io.to(zhuangJia.id).emit('logging', { message: " 你选择了杀" })
        io.to(xianJia.id).emit('xianTurnForUnCoverCardsZhuangSha', { name: zhuangJia.name })

    });


    client.on('xianUnCoverCardsZhuangShaXianRenShu', function () {

        var xianJia = room.getPlayer(client.id);
        var table = room.getTable(xianJia.tableID);
        var zhuangJia = table.whoIsZhuang()
        xianJia.rounds++
        xianJia.loss++
        zhuangJia.wins++
        xianJia.drankCups = Number(xianJia.drankCups) + 0.5
        table.removeXianToBeProcess();
        table.finishedPlays++
        table.updateRoundDrank(zhuangJia.name, 0)//update each round drinking
        table.updateRoundDrank(xianJia.name, 0.5)
        messaging.sendEventToAllPlayersButZhuangOrXian('logging', { message: zhuangJia.name + "和" + xianJia.name + "游戏结果:" + xianJia.name + "开牌, " + zhuangJia.name + "杀，" + xianJia.name + "怂逼接受喝半杯" }, io, table.players, zhuangJia, xianJia)
        io.to(xianJia.id).emit('logging', { message: "庄家" + zhuangJia.name + "杀你，你怂逼接受喝半杯" })
        io.to(zhuangJia.id).emit('logging', { message: "你杀闲家闲家认怂喝半杯，你赢了" })

        if (table.xianToBeProcess.length >= 1) {
            var firstXian = table.xianToBeProcess[0];
            if (firstXian.move === "gaiPai") {
                setTimeout(function () { io.to(zhuangJia.id).emit('zhuangDecisionForXianCover', { xianJia: firstXian.name }); }, 800);
            } else if (firstXian.move === "kaiPai") {
                setTimeout(function () { io.to(zhuangJia.id).emit('zhuangDecisionForXianUnCover', { xianJia: firstXian.name }); }, 800);
            } else if (firstXian.move === "qiangGong") {
                setTimeout(function () { io.to(zhuangJia.id).emit('zhuangDecisionForXianQiangGong', { xianJia: firstXian.name }); }, 800);
            }
        }

        if (table.finishedPlays === table.players.length - 1) {
            table.rounds++
            zhuangJia.rounds++
            table.finishedPlays = 0;//reset
            messaging.sendEventToAllPlayers('drankCupsDisplay', { drankCups: table.roundDrankCups }, io, table.players)
            var countdown = 6; //3 seconds in reality...
            timer = setInterval(function () {
                countdown--;
                messaging.sendEventToAllPlayers('newRound', { countdown: countdown, display: false }, io, table.players);
            }, 1000);
        }

    })


    client.on('xianUnCoverCardsZhuangShaXianQiangGong', function () {
        var xianJia = room.getPlayer(client.id);
        var table = room.getTable(xianJia.tableID);
        var zhuangJia = table.whoIsZhuang()

        var result = checkWin.xianWinOneSide(zhuangJia.cardStatus, xianJia.cardStatus, zhuangJia.name, xianJia.name)
        checkWin.updateGameStaus(zhuangJia, xianJia, result)
        table.updateRoundDrank(zhuangJia.name, result.zhuangDrankCups)//update each round d
        table.updateRoundDrank(xianJia.name, result.xianDrankCups)
        messaging.sendEventToAllPlayersButZhuangOrXian('logging', { message: zhuangJia.name + "和" + xianJia.name + "游戏结果:" + result.comment }, io, table.players, zhuangJia, xianJia)
        io.to(xianJia.id).emit('logging', { message: result.commentToXian })
        io.to(zhuangJia.id).emit('logging', { message: result.commentToZhuang })

        io.to(xianJia.id).emit('unCoverCards', { cards: zhuangJia.hand, playerName: zhuangJia.name })

        xianJia.rounds++
        table.removeXianToBeProcess();
        table.finishedPlays++

        if (table.xianToBeProcess.length >= 1) {
            var firstXian = table.xianToBeProcess[0];
            if (firstXian.move === "gaiPai") {
                setTimeout(function () { io.to(zhuangJia.id).emit('zhuangDecisionForXianCover', { xianJia: firstXian.name }); }, 800);
            } else if (firstXian.move === "kaiPai") {
                setTimeout(function () { io.to(zhuangJia.id).emit('zhuangDecisionForXianUnCover', { xianJia: firstXian.name }); }, 800);
            } else if (firstXian.move === "qiangGong") {
                setTimeout(function () { io.to(zhuangJia.id).emit('zhuangDecisionForXianQiangGong', { xianJia: firstXian.name }); }, 800);
            }
        }

        if (table.finishedPlays === table.players.length - 1) {
            table.rounds++
            zhuangJia.rounds++
            table.finishedPlays = 0;//reset
            messaging.sendEventToAllPlayers('drankCupsDisplay', { drankCups: table.roundDrankCups }, io, table.players)
            var countdown = 6; //3 seconds in reality...
            timer = setInterval(function () {
                countdown--;
                messaging.sendEventToAllPlayers('newRound', { countdown: countdown, display: false }, io, table.players);
            }, 1000);

        }

    });


    client.on('XianUnCoverCardsZhuangZouShui', function () {
        var zhuangJia = room.getPlayer(client.id);
        var table = room.getTable(zhuangJia.tableID);
        var xianJia = table.xianToBeProcess[0]
        io.to(xianJia.id).emit('logging', { message: "庄家" + zhuangJia.name + "想走水，你怎么看" })
        io.to(zhuangJia.id).emit('logging', { message: "你选择了走水" })
        io.to(xianJia.id).emit('xianTurnForUnCoverCardsZhuangZouShui', { name: zhuangJia.name })

    });

    client.on('xianUnCoverCardsZhuangZouXianAccept', function () {
        var xianJia = room.getPlayer(client.id);
        var table = room.getTable(xianJia.tableID);
        var zhuangJia = table.whoIsZhuang()
        xianJia.rounds++
        table.removeXianToBeProcess();
        table.finishedPlays++
        table.updateRoundDrank(zhuangJia.name, 0)//update each round driking
        table.updateRoundDrank(xianJia.name, 0)

        messaging.sendEventToAllPlayersButZhuangOrXian('logging', { message: zhuangJia.name + "和" + xianJia.name + "游戏结果:" + xianJia.name + "开牌, " + zhuangJia.name + "怂逼走水，" + xianJia.name + "怂逼接受，啥也没发生" }, io, table.players, zhuangJia, xianJia)
        io.to(xianJia.id).emit('logging', { message: "庄家" + zhuangJia.name + "怂逼走水，你怂逼接受，个个都母使饮" })
        io.to(zhuangJia.id).emit('logging', { message: "你怂逼走水，闲家怂逼接受，这把谁都不喝" })


        if (table.xianToBeProcess.length >= 1) {
            var firstXian = table.xianToBeProcess[0];
            if (firstXian.move === "gaiPai") {
                setTimeout(function () { io.to(zhuangJia.id).emit('zhuangDecisionForXianCover', { xianJia: firstXian.name }); }, 800);
            } else if (firstXian.move === "kaiPai") {
                setTimeout(function () { io.to(zhuangJia.id).emit('zhuangDecisionForXianUnCover', { xianJia: firstXian.name }); }, 800);
            } else if (firstXian.move === "qiangGong") {
                setTimeout(function () { io.to(zhuangJia.id).emit('zhuangDecisionForXianQiangGong', { xianJia: firstXian.name }); }, 800);
            }
        }

        if (table.finishedPlays === table.players.length - 1) {
            table.rounds++
            zhuangJia.rounds++
            table.finishedPlays = 0;//reset
            messaging.sendEventToAllPlayers('drankCupsDisplay', { drankCups: table.roundDrankCups }, io, table.players)
            var countdown = 6; //3 seconds in reality...
            timer = setInterval(function () {
                countdown--;
                messaging.sendEventToAllPlayers('newRound', { countdown: countdown, display: false }, io, table.players);
            }, 1000);

        }

    })

    client.on('xianUnCoverCardsZhuangZouXianSha', function () {
        var xianJia = room.getPlayer(client.id);
        var table = room.getTable(xianJia.tableID);
        var zhuangJia = table.whoIsZhuang()

        xianJia.rounds++
        table.removeXianToBeProcess()
        table.finishedPlays++
        var result = checkWin.zhuangWinOneSide(zhuangJia.cardStatus, xianJia.cardStatus, zhuangJia.name, xianJia.name)
        checkWin.updateGameStaus(zhuangJia, xianJia, result)
        table.updateRoundDrank(zhuangJia.name, result.zhuangDrankCups)//update each round d
        table.updateRoundDrank(xianJia.name, result.xianDrankCups)
        messaging.sendEventToAllPlayersButZhuangOrXian('logging', { message: zhuangJia.name + "和" + xianJia.name + "游戏结果:" + result.comment }, io, table.players, zhuangJia, xianJia)
        io.to(xianJia.id).emit('logging', { message: result.commentToXian })
        io.to(zhuangJia.id).emit('logging', { message: result.commentToZhuang })
        io.to(xianJia.id).emit('unCoverCards', { cards: zhuangJia.hand, playerName: zhuangJia.name })



        if (table.xianToBeProcess.length >= 1) {
            var firstXian = table.xianToBeProcess[0];
            if (firstXian.move === "gaiPai") {
                setTimeout(function () { io.to(zhuangJia.id).emit('zhuangDecisionForXianCover', { xianJia: firstXian.name }); }, 800);
            } else if (firstXian.move === "kaiPai") {
                setTimeout(function () { io.to(zhuangJia.id).emit('zhuangDecisionForXianUnCover', { xianJia: firstXian.name }); }, 800);
            } else if (firstXian.move === "qiangGong") {
                setTimeout(function () { io.to(zhuangJia.id).emit('zhuangDecisionForXianQiangGong', { xianJia: firstXian.name }); }, 800);
            }
        }

        if (table.finishedPlays === table.players.length - 1) {
            table.rounds++
            zhuangJia.rounds++
            table.finishedPlays = 0;//reset
            messaging.sendEventToAllPlayers('drankCupsDisplay', { drankCups: table.roundDrankCups }, io, table.players)
            var countdown = 6; //3 seconds in reality...
            timer = setInterval(function () {
                countdown--;
                messaging.sendEventToAllPlayers('newRound', { countdown: countdown, display: false }, io, table.players);
            }, 1000);

        }
    })


    client.on('backToLounge', function () {
        var player = room.getPlayer(client.id);

        if ((player && player.status === "available") || (player && player.status === "")) {
            io.to(player.id).emit('logging', { message: "别按了，你现在就在大厅。" })
        }

        if (player && player.status === "intable") {
            var table = room.getTable(player.tableID);
            player.tableID = "";//reset player ID
            table.removePlayer(player);
            player.status = "available";
            messaging.sendEventToAllPlayers('logging', { message: player.name + "离开了" + table.name + "，当前" + table.name + "有" + table.players.length + "名玩家，" + "还需要" + (table.maxPlayerLimit - table.players.length) + "名玩家。" }, io, table.players)
            io.to(player.id).emit('logging', { message: "你离开了" + table.name + "，回到了水鱼大厅。" })
        }

    })

    client.on('exitGame', function () {
        var player = room.getPlayer(client.id);
        if (player && player.status === "intable") {
            clearInterval(timer)
            var table = room.getTable(player.tableID);

            for (var i = 0; i < table.players.length; i++) {
                db.opponents.update({ username: table.players[i].name }, { $inc: { [table.players[i].name + '.' + table.createNameArr(table.players[i])[0]]: table.players[i].rounds } })
                for (var j = 1; j < table.createNameArr(table.players[i]).length; j++) {
                    db.opponents.update({ username: table.players[i].name }, { $inc: { [table.players[i].name + '.' + table.createNameArr(table.players[i])[j]]: table.players[i].rounds } })
                }
                if (table.whoIsZhuang() && table.players[i].name === table.whoIsZhuang().name) {
                    db.status.update({ username: table.players[i].name }, { $inc: { points: table.players[i].wins - table.players[i].loss, rounds: table.players[i].rounds, wins: table.players[i].wins, loss: table.players[i].loss, drank: table.players[i].drankCups, zhuang: table.players[i].rounds } })
                } else {
                    db.status.update({ username: table.players[i].name }, { $inc: { points: table.players[i].wins - table.players[i].loss, rounds: table.players[i].rounds, wins: table.players[i].wins, loss: table.players[i].loss, drank: table.players[i].drankCups, xian: table.players[i].rounds } })
                }
                table.players[i].resetPlayer();//reset all remaining players    
            }
            player.resetPlayer();//reset player
            player.tableID = "";//reset player ID
            table.removePlayer(player);
            table.resetTable(); //reset table
            player.status = "available";
            messaging.sendEventToAllPlayers('logging', { message: player.name + "离开了游戏桌，游戏中止，" + "当前" + table.name + "有" + table.players.length + "名玩家，" + "还需要" + (table.maxPlayerLimit - table.players.length) + "名玩家。" }, io, table.players)
            messaging.sendEventToAllPlayers('interruption', { name: player.name }, io, table.players)
            io.to(player.id).emit('logging', { message: "你离开了" + table.name + "，回到了水鱼大厅。" })
            io.to(player.id).emit('interruption', { name: "你" })
        }

    })

    client.on('disconnect', function () {
        var player = room.getPlayer(client.id);
        //here needs review what about player "playing" disconnect?     
        if (player) {
            room.removePlayer(player)//remove player if him/she close browser
        }
        if (player && player.status === "intable") { //make sure that player either exists or if player was in table (we don't want to remove players)
            //Remove from table
            clearInterval(timer)//in case in the middle of init a game
            var table = room.getTable(player.tableID);
            if (table.status === "unavailable") {
                for (var i = 0; i < table.players.length; i++) {
                    db.opponents.update({ username: table.players[i].name }, { $inc: { [table.players[i].name + '.' + table.createNameArr(table.players[i])[0]]: table.players[i].rounds } })
                    for (var j = 1; j < table.createNameArr(table.players[i]).length; j++) {
                        db.opponents.update({ username: table.players[i].name }, { $inc: { [table.players[i].name + '.' + table.createNameArr(table.players[i])[j]]: table.players[i].rounds } })
                    }
                    if (table.whoIsZhuang() && table.players[i].name === table.whoIsZhuang().name) {
                        db.status.update({ username: table.players[i].name }, { $inc: { points: table.players[i].wins - table.players[i].loss, rounds: table.players[i].rounds, wins: table.players[i].wins, loss: table.players[i].loss, drank: table.players[i].drankCups, zhuang: table.players[i].rounds } })
                    } else {
                        db.status.update({ username: table.players[i].name }, { $inc: { points: table.players[i].wins - table.players[i].loss, rounds: table.players[i].rounds, wins: table.players[i].wins, loss: table.players[i].loss, drank: table.players[i].drankCups, xian: table.players[i].rounds } })
                    }
                    table.players[i].resetPlayer();//reset all remaining players
                }
            } else {
                for (var i = 0; i < table.players.length; i++) {
                    table.players[i].resetPlayer();//reset all remaining players
                }
            }
            table.removePlayer(player);
            table.resetTable(); //reset table
            player.status = "available";
            messaging.sendEventToAllPlayers('logging', { message: player.name + "离开了游戏桌，游戏中止，" + "当前" + table.name + "有" + table.players.length + "名玩家，" + "还需要" + (table.maxPlayerLimit - table.players.length) + "名玩家。" }, io, table.players)
            messaging.sendEventToAllPlayers('interruption', { name: player.name }, io, table.players)//to reset the browser rendering
        }

    });
    //chatting function
    client.on('msg', function (data) {
        var player = room.getPlayer(client.id);
        if (player.status === "intable") {
            // io.emit('newmsg', data);
            var table = room.getTable(player.tableID);
            messaging.sendEventToAllPlayers('newmsg', { message: data.message, user: data.user }, io, table.players)
        } else {
            messaging.sendEventToAllNotPlaying('newmsg', { message: data.message, user: data.user }, io, room.players)

        }
    })
});

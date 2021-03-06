var socket = io();

//var socket = io.connect("148.72.246.160:8000");
//for chatting

function Sound() {
    this.sound = document.createElement("audio");
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function () {
        this.sound.play();
    }
    this.stop = function () {
        this.sound.pause();
    }
}

Sound.prototype.set = function (src) {
    this.sound.src = src;
    this.play()
}

var mySound;
var user;
var statusD = [];

$(document).ready(function () {
    mySound = new Sound();
    //prevent type more than 5 chinese characters;
    $("#player,#signUpUname").on("keydown change", function (e) {
        if (e.keyCode == 8)
            return;
        var x = $(this).val();
        if (x.match(/[\u3400-\u9FBF]/) && x.length >= 5) {
            e.preventDefault();
            $(this).val(x.substring(0, 5));
        } /* else if (x.length >= 9){
            e.preventDefault();
            $(this).val(x.substring(0,9));
        }*/
    });
    //prevent FireFox open a new tab on drop event;
    document.body.ondrop = function (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    $("#signUpForm").on('submit', function (event) {
        $("#error-container").html("");
        $("#id01").css("display", "none");
        socket.emit('signUp', {
            username: $("#signUpUname").val(),
            password: $("#signUpPws").val()
        });
        // Stops the form from redirecting the web page to the action link
        event.preventDefault();
    });
    //table mouseover referred to line 555 (displayRanking)
    $("#h1,#h2,#h3").on("touchstart mouseover", function (e) {
        for (var i = 0; i < statusD.length; i++) {
            if ($(this).html().slice(0, -4) === statusD[i].username) {
                var per = ((statusD[i].wins / statusD[i].rounds) * 100).toFixed(2) || 0
                if (statusD[i].points < 20) { var level = "低到看不清" }
                else if (statusD[i].points < 40) { var level = "小小水鱼" }
                else if (statusD[i].points < 60) { var level = "小水鱼" }
                else if (statusD[i].points < 80) { var level = "水鱼" }
                else if (statusD[i].points < 100) { var level = "大水鱼" }
                else { var level = "中华鳖" }
                $("body").append('<div class="status"><span class="statusText">级别：' + level + '<br>积分：' + statusD[i].points + '<br>局数：' + statusD[i].rounds + ' <br>水鱼次数：' + statusD[i].shuiyu + ' <br>赢：' + statusD[i].wins + ' <br>输: ' + statusD[i].loss + ' <br>胜率：' + per + "%" + ' <br>罚酒杯数：' + statusD[i].drank + ' <br>坐庄次数：' + statusD[i].zhuang + ' <br>最常和谁玩：' + statusD[i].mostPlayed + ' <br>次数：' + statusD[i].playedTimes + '</span></div>')
            }
        }
        if (e.type === "mouseover") {
            $(".status").css({ top: e.clientY, left: e.clientX })
        } else {
            $(".status").css({ top: e.touches[0].clientY, left: e.touches[0].clientX })
        }
        e.preventDefault();
    });
    $("#h1,#h2,#h3").on("touchend mouseout", function (e) {
        $(".status").remove();
        e.preventDefault();
    });
});


function CustomConfirm() {
    this.render = function (dialog, op, id) {
        dialogbox.style.display = "block";

        document.getElementById('dialogboxhead').innerHTML = "闲家话事：";
        document.getElementById('dialogboxbody').innerHTML = dialog;
        document.getElementById('dialogboxfoot').innerHTML = '<button onclick="Confirm.yes(\'' + op + '\',\'' + id + '\')">好波，认输</button> <button onclick="Confirm.no()">信地毛，开牌</button>';
    }

    this.no = function () {
        document.getElementById('dialogbox').style.display = "none";
        socket.emit("xianCoverCardsZhuangSha")
    }
    this.yes = function () {
        document.getElementById('dialogbox').style.display = "none";
        socket.emit("xianCoverCardsZhuangRenShu");

    }

}

var Confirm = new CustomConfirm();

function QiangGongCustomConfirm() {
    this.render = function (dialog, op, id) {
        dialogbox.style.display = "block";

        document.getElementById('dialogboxhead').innerHTML = "闲家话事：";
        document.getElementById('dialogboxbody').innerHTML = dialog;
        document.getElementById('dialogboxfoot').innerHTML = '<button onclick="QiangGongConfirm.yes(\'' + op + '\',\'' + id + '\')">好波，认输</button> <button onclick="QiangGongConfirm.no()">信地毛，杀</button>';
    }

    this.no = function () {
        document.getElementById('dialogbox').style.display = "none";
        socket.emit("xianQiangGongZhuangSha")
    }
    this.yes = function () {
        document.getElementById('dialogbox').style.display = "none";
        socket.emit("XianQiangGongZhuangRenShu");

    }

}

var QiangGongConfirm = new QiangGongCustomConfirm()


function ZhuangCustomConfirm() {
    this.render = function (dialog, op, id) {

        dialogbox.style.display = "block";

        document.getElementById('dialogboxhead').innerHTML = "闲家话事：";
        document.getElementById('dialogboxbody').innerHTML = dialog;
        document.getElementById('dialogboxfoot').innerHTML = '<button onclick="ZhuangConfirm.yes(\'' + op + '\',\'' + id + '\')">好波，走水</button> <button onclick="ZhuangConfirm.no()">怕黑，杀佢</button>';
    }

    this.no = function () {
        document.getElementById('dialogbox').style.display = "none";
        socket.emit("XianUnCoverCardsZhuangSha")
    }
    this.yes = function () {
        document.getElementById('dialogbox').style.display = "none";
        socket.emit("XianUnCoverCardsZhuangZouShui");

    }


}

var ZhuangConfirm = new ZhuangCustomConfirm();


function ZhuangShaXianCustomConfirm() {
    this.render = function (dialog, op, id) {
        dialogbox.style.display = "block";

        document.getElementById('dialogboxhead').innerHTML = "庄家话事：";
        document.getElementById('dialogboxbody').innerHTML = dialog;
        document.getElementById('dialogboxfoot').innerHTML = '<button onclick="ZhuangShaXian.yes(\'' + op + '\',\'' + id + '\')">好波，接受</button> <button onclick="ZhuangShaXian.no()">母信，强攻</button>';
    }

    this.no = function () {
        document.getElementById('dialogbox').style.display = "none";
        socket.emit("xianUnCoverCardsZhuangShaXianQiangGong")
    }
    this.yes = function () {
        document.getElementById('dialogbox').style.display = "none";
        socket.emit("xianUnCoverCardsZhuangShaXianRenShu");

    }

}

var ZhuangShaXian = new ZhuangShaXianCustomConfirm();


function ZhuangCustomAlert() {
    this.render = function (dialog) {
        dialogbox.style.display = "block";
        document.getElementById('dialogboxhead').innerHTML = "庄家：";
        document.getElementById('dialogboxbody').innerHTML = dialog;
        document.getElementById('dialogboxfoot').innerHTML = '<button onclick="ZhuangConShuiZha.ok()">好波</button>';
    }
    this.ok = function () {
        document.getElementById('dialogbox').style.display = "none";
        socket.emit("xianShuiZhaCheckWin")
    }
}


var ZhuangConShuiZha = new ZhuangCustomAlert();


function XianCustomAlert() {
    this.render = function (dialog) {
        dialogbox.style.display = "block";
        document.getElementById('dialogboxhead').innerHTML = "闲家：";
        document.getElementById('dialogboxbody').innerHTML = dialog;
        document.getElementById('dialogboxfoot').innerHTML = '<button onclick="XianConShuiZha.ok()">好波</button>';
    }
    this.ok = function () {
        document.getElementById('dialogbox').style.display = "none";
    }
}

var XianConShuiZha = new XianCustomAlert();


function ZhuangZouShuiCustomConfirm() {
    this.render = function (dialog, op, id) {
        dialogbox.style.display = "block";

        document.getElementById('dialogboxhead').innerHTML = "庄家话事：";
        document.getElementById('dialogboxbody').innerHTML = dialog;
        document.getElementById('dialogboxfoot').innerHTML = '<button onclick="ZhuangZouShui.yes(\'' + op + '\',\'' + id + '\')">好波，接受</button> <button onclick="ZhuangZouShui.no()">母得，杀佢</button>';
    }

    this.no = function () {
        document.getElementById('dialogbox').style.display = "none";
        socket.emit("xianUnCoverCardsZhuangZouXianSha")
    }
    this.yes = function () {
        document.getElementById('dialogbox').style.display = "none";
        socket.emit("xianUnCoverCardsZhuangZouXianAccept");

    }


}

var ZhuangZouShui = new ZhuangZouShuiCustomConfirm();

//show laiZi select     
function checkLaiZi(hand) {
    for (var i = 0; i < hand.length; i++) {
        var x = "card" + (i + 1)
        if (Number(hand[i]) === 14.1 || Number(hand[i]) === 14.2)
            document.getElementById(x).getElementsByTagName('select')[0].style.visibility = "visible";
    }
}
function laiZiChange1() {
    var x = document.getElementById("card1Change").value;
    var address = x + ".01" + ".jpg"
    document.getElementById("selfCard1").src = '/poker/' + address;
    document.getElementById("card1Change").style.visibility = "hidden"
}

function laiZiChange2() {
    var x = document.getElementById("card2Change").value;
    var address = x + ".01" + ".jpg"
    document.getElementById("selfCard2").src = '/poker/' + address
    document.getElementById("card2Change").style.visibility = "hidden"
}

function laiZiChange3() {
    var x = document.getElementById("card3Change").value;
    var address = x + ".01" + ".jpg"
    document.getElementById("selfCard3").src = '/poker/' + address
    document.getElementById("card3Change").style.visibility = "hidden"
}

function laiZiChange4() {
    var x = document.getElementById("card4Change").value;
    var address = x + ".01" + ".jpg"
    document.getElementById("selfCard4").src = '/poker/' + address
    document.getElementById("card4Change").style.visibility = "hidden"
}



function showCards(array) {
    //var path = path || 'http://realeastgod.com/'; 
    var path = '/poker/';

    var address1 = path + array[0] + ".jpg"
    var address2 = path + array[1] + ".jpg"
    var address3 = path + array[2] + ".jpg"
    var address4 = path + array[3] + ".jpg"

    if (!$('#selfCard1').length) {
        $('<img id = "selfCard1", draggable="true"></img>').insertAfter("#c1");
        $('<img id = "selfCard2", draggable="true"></img>').insertAfter("#c2");
        $('<img id = "selfCard3", draggable="true"></img>').insertAfter("#c3");
        $('<img id = "selfCard4", draggable="true"></img>').insertAfter("#c4");
        $("#card1").find("img").attr("src", address1);
        $("#card2").find("img").attr("src", address2);
        $("#card3").find("img").attr("src", address3);
        $("#card4").find("img").attr("src", address4);
    } else {
        $("#card1").find("img").attr("src", address1);
        $("#card2").find("img").attr("src", address2);
        $("#card3").find("img").attr("src", address3);
        $("#card4").find("img").attr("src", address4);

    }
}

function hideCards(names) {

    for (var i = 0; i < names.length; i++) {
        var id = i + 1;
        if (!$('#' + "player" + id + "img1").length) {
            $('#' + "player" + id + "card1").append(' <img class="middle", id = "player' + id + 'img1"></img>');;
            $('#' + "player" + id + "card2").append(' <img class="middle", id = "player' + id + 'img2"></img>');;
            $('#' + "player" + id + "card3").append(' <img class="middle", id = "player' + id + 'img3"></img>');;
            $('<img class="middle", id =  "player' + id + 'img4"></img>').insertBefore('#' + "h" + id);
        }
        $(".middle").attr("src", "/poker/back.jpg");
    }
}


function coverCard() {
    mySound.set("/sounds/click.mp3")
    $("#coverCard,#showCard,#forceAttack").css("visibility", "hidden")
    socket.emit("xianCoverCard");
};

function unCoverCard() {
    mySound.set("/sounds/click.mp3")
    $("#coverCard,#showCard,#forceAttack").css("visibility", "hidden")
    socket.emit("xianUnCoverCard");
};

function qiangGong() {
    mySound.set("/sounds/click.mp3")
    $("#coverCard,#showCard,#forceAttack").css("visibility", "hidden")
    socket.emit("xianQiangGong");
};



function cardsBuilded() {
    mySound.set("/sounds/click.mp3")
    var left1 = Number(document.getElementById('card1').getElementsByTagName('img')[0].src.split('/').pop().slice(0, -4));
    if (left1 === 14.1 || left1 === 14.2) {
        document.getElementById('card1').getElementsByTagName('img')[0].src = '/poker/' + Math.floor(Math.random() * 13 + 1).toString() + ".01" + ".jpg"
        left1 = Number(document.getElementById('card1').getElementsByTagName('img')[0].src.split('/').pop().slice(0, -4));
    }
    var left2 = Number(document.getElementById('card2').getElementsByTagName('img')[0].src.split('/').pop().slice(0, -4));
    if (left2 === 14.1 || left2 === 14.2) {
        document.getElementById('card2').getElementsByTagName('img')[0].src = '/poker/' + Math.floor(Math.random() * 13 + 1).toString() + ".01" + ".jpg"
        left2 = Number(document.getElementById('card2').getElementsByTagName('img')[0].src.split('/').pop().slice(0, -4));
    }
    var left3 = Number(document.getElementById('card3').getElementsByTagName('img')[0].src.split('/').pop().slice(0, -4));
    if (left3 === 14.1 || left3 === 14.2) {
        document.getElementById('card3').getElementsByTagName('img')[0].src = '/poker/' + Math.floor(Math.random() * 13 + 1).toString() + ".01" + ".jpg"
        left3 = Number(document.getElementById('card3').getElementsByTagName('img')[0].src.split('/').pop().slice(0, -4));
    }
    var left4 = Number(document.getElementById('card4').getElementsByTagName('img')[0].src.split('/').pop().slice(0, -4));
    if (left4 === 14.1 || left4 === 14.2) {
        document.getElementById('card4').getElementsByTagName('img')[0].src = '/poker/' + Math.floor(Math.random() * 13 + 1).toString() + ".01" + ".jpg"
        left4 = Number(document.getElementById('card4').getElementsByTagName('img')[0].src.split('/').pop().slice(0, -4));
    }

    var selects = document.querySelectorAll('select');
    [].forEach.call(selects, function (select) {
        select.style.visibility = "hidden"
        select.selectedIndex = 0;
    });
    var pack = [];
    pack.push(left1);
    pack.push(left2);
    pack.push(left3);
    pack.push(left4);
    document.getElementById("buildCards").style.visibility = "hidden";
    socket.emit("finalHand", pack);
    var cards = document.querySelectorAll('.card');
    [].forEach.call(cards, function (card) {
        card.removeEventListener('dragstart', handleDragStart, false);
        card.removeEventListener('dragenter', handleDragEnter, false)
        card.removeEventListener('dragover', handleDragOver, false);
        card.removeEventListener('dragleave', handleDragLeave, false);
        card.removeEventListener('drop', handleDrop, false);
        card.removeEventListener('dragend', handleDragEnd, false);
    });
}



function displayNames(nameArr, zhuangName) {
    for (var i = 0; i < nameArr.length; i++) {
        if (zhuangName == nameArr[i]) {
            nameArr[i] = nameArr[i] + "（庄家）"
        } else {
            nameArr[i] = nameArr[i] + "（闲家）"
        }

    }

    if (nameArr[0]) {
        document.getElementById('h1').innerHTML = nameArr[0]
    }
    if (nameArr[1]) {
        document.getElementById('h2').innerHTML = nameArr[1]
    }
    if (nameArr[2]) {
        document.getElementById('h3').innerHTML = nameArr[2]
    }
}

function showDrankCups(obj) {
    var keys = Object.keys(obj)
    var xian1 = document.getElementById('h1').innerHTML.slice(0, -4)
    var xian2 = document.getElementById('h2').innerHTML.slice(0, -4)
    var xian3 = document.getElementById('h3').innerHTML.slice(0, -4)

    $(document).ready(function () {
        $("#playerD1").html('+' + obj[xian1] + ' <img src=" /poker/beer.png">').fadeIn(5000).fadeOut(5000)
        keys.splice(keys.indexOf(xian1), 1)

        if (keys.indexOf(xian2) > -1) {
            $("#playerD2").html('+' + obj[xian2] + ' <img src=" /poker/beer.png">').fadeIn(5000).fadeOut(5000)
            keys.splice(keys.indexOf(xian2), 1)
        }
        if (keys.indexOf(xian3) > -1) {
            $("#playerD3").html('+' + obj[xian3] + ' <img src=" /poker/beer.png">').fadeIn(5000).fadeOut(5000)
            keys.splice(keys.indexOf(xian3), 1)
        }
        $("#self").html('+' + obj[keys[0]] + ' <img src=" /poker/beer.png">').fadeIn(5000).fadeOut(5000)
    });
}


function showOthersCards(name, hand) {

    var address1 = '/poker/' + hand[0] + ".jpg"
    var address2 = '/poker/' + hand[1] + ".jpg"
    var address3 = '/poker/' + hand[2] + ".jpg"
    var address4 = '/poker/' + hand[3] + ".jpg"

    if (document.getElementById('h1').innerHTML.slice(0, -4) == name) {
        $("#player1img1").attr("src", address1);
        $("#player1img2").attr("src", address2);
        $("#player1img3").attr("src", address3);
        $("#player1img4").attr("src", address4);
    } else if (document.getElementById('h2').innerHTML.slice(0, -4) == name) {
        $("#player2img1").attr("src", address1);
        $("#player2img2").attr("src", address2);
        $("#player2img3").attr("src", address3);
        $("#player2img4").attr("src", address4);
    } else if (document.getElementById('h3').innerHTML.slice(0, -4) == name) {
        $("#player3img1").attr("src", address1);
        $("#player3img2").attr("src", address2);
        $("#player3img3").attr("src", address3);
        $("#player3img4").attr("src", address4);
    }

}

function showQiangGongCards(name, hand) {

    var address1 = '/poker/' + hand[0] + ".jpg"
    var address2 = '/poker/' + hand[1] + ".jpg"

    if (document.getElementById('h1').innerHTML.slice(0, -4) == name) {
        document.getElementById("player1img1").src = address1;
        document.getElementById("player1img2").src = address2;
    } else if (document.getElementById('h2').innerHTML.slice(0, -4) == name) {
        document.getElementById("player2img1").src = address1;
        document.getElementById("player2img2").src = address2;
    } else if (document.getElementById('h3').innerHTML.slice(0, -4) == name) {
        document.getElementById("player3img1").src = address1;
        document.getElementById("player3img2").src = address2;
    }

}





//enbale enter pressing to login
function handleLogin(e) {
    if (e.keyCode === 13) {
        e.preventDefault(); // Ensure it is only this code that runs
        $("#error-container").html("")//might need to delete
        var name = document.getElementById("signUp-uname").value
        var password = document.getElementById("signUp-psw").value
        if (name && password) {
            socket.emit("signIn", { username: name, password: password });
        } else {
            $("#error-container").html("请输入完整的用户名或密码")
        }
    }
}
//disallow white space in username
function noWhiteSpace(e) {
    var key = e.keyCode;
    if (key === 32) {
        e.preventDefault();
    }
}


//ranking display function

function displayRanking(information) {
    var table = document.createElement("table");
    table.setAttribute("id", "table");

    var row, theader, tcell = null;

    //create first row of the table (table header) 
    row = table.insertRow();
    theader = document.createElement('th');
    theader.innerHTML = "排行榜";
    $(row).append(theader);

    //create table header data
    for (var i = 0; i < information.length; i++) {
        theader = document.createElement('th');
        theader.innerHTML = information[i].name
        $(row).append(theader);
    }

    //create second row of the table
    row = table.insertRow();
    var tcell = document.createElement('td');
    tcell.innerHTML = "局数";
    $(row).append(tcell);
    //generate player rounds data
    for (var j = 0; j < information.length; j++) {
        tcell = document.createElement('td');
        tcell.innerHTML = information[j].rounds;
        $(row).append(tcell);
    }

    //create third row of the table
    row = table.insertRow();
    var tcell = document.createElement('td');
    tcell.innerHTML = "罚酒";
    $(row).append(tcell);
    //generate player penalized data
    for (var u = 0; u < information.length; u++) {
        tcell = document.createElement('td');
        tcell.innerHTML = information[u].drankCups;
        $(row).append(tcell);
    }
    //create fourth row of the table
    row = table.insertRow();
    var tcell = document.createElement('td');
    tcell.innerHTML = "胜利";
    $(row).append(tcell);
    //generate player wins data
    for (var k = 0; k < information.length; k++) {
        tcell = document.createElement('td');
        tcell.innerHTML = information[k].wins;
        $(row).append(tcell);
    }
    //create fifth row of the table
    row = table.insertRow();
    var tcell = document.createElement('td');
    tcell.innerHTML = "失败";
    $(row).append(tcell);
    //generate player loss data
    for (var h = 0; h < information.length; h++) {
        tcell = document.createElement('td');
        tcell.innerHTML = information[h].loss;
        $(row).append(tcell);
    }

    //add whole table to the div
    $("#table-wrapper").html(table);
    $("#table").find("th").slice(1).on("touchstart mouseover", function (e) {
        for (var i = 0; i < statusD.length; i++) {
            if ($(this).html() === statusD[i].username) {
                if (statusD[i].points < 20) { var level = "低到看不清" }
                else if (statusD[i].points < 40) { var level = "小小水鱼" }
                else if (statusD[i].points < 60) { var level = "小水鱼" }
                else if (statusD[i].points < 80) { var level = "水鱼" }
                else if (statusD[i].points < 100) { var level = "大水鱼" }
                else { var level = "中华鳖" }
                var per = ((statusD[i].wins / statusD[i].rounds) * 100).toFixed(2) || 0
                $("body").append('<div class="status"><span class="statusText">级别：' + level + '<br>积分：' + statusD[i].points + '<br>局数：' + statusD[i].rounds + ' <br>水鱼次数：' + statusD[i].shuiyu + ' <br>赢：' + statusD[i].wins + ' <br>输: ' + statusD[i].loss + ' <br>胜率：' + per + "%" + ' <br>罚酒杯数：' + statusD[i].drank + ' <br>坐庄次数：' + statusD[i].zhuang + ' <br>最常和谁玩：' + statusD[i].mostPlayed + ' <br>次数：' + statusD[i].playedTimes + '</span></div>')
            }
        }
        if (e.type === "mouseover") {
            $(".status").css({ top: e.clientY, left: e.clientX })
        } else {
            $(".status").css({ top: e.touches[0].clientY, left: e.touches[0].clientX })
        }
        e.preventDefault();
    });
    $("#table").find("th").slice(1).on("touchend mouseout", function (e) {
        $(".status").remove();
        e.preventDefault();
    });
}




function displayRoomVacan(arr) {
    var room = document.getElementsByClassName("select")
    if (arr[0] < 2) {
        room[0].getElementsByTagName('a')[0].textContent = "----横州(空闲)----"
    } else {
        room[0].getElementsByTagName('a')[0].textContent = "----横州(人满)----"
    }
    if (arr[1] < 2) {
        room[1].getElementsByTagName('a')[0].textContent = "----百合(空闲)----"
    } else {
        room[1].getElementsByTagName('a')[0].textContent = "----百合(人满)----"
    }
    if (arr[2] < 2) {
        room[2].getElementsByTagName('a')[0].textContent = "----蒙垌(空闲)----"
    } else {
        room[2].getElementsByTagName('a')[0].textContent = "----蒙垌(人满)----"
    }
    if (arr[3] < 3) {
        room[3].getElementsByTagName('a')[0].textContent = "---三角坪(空闲)---"
    } else {
        room[3].getElementsByTagName('a')[0].textContent = "---三角坪(人满)---"
    }
    if (arr[4] < 3) {
        room[4].getElementsByTagName('a')[0].textContent = "---山泊塘(空闲)---"
    } else {
        room[4].getElementsByTagName('a')[0].textContent = "---山泊塘(人满)---"
    }
    if (arr[5] < 3) {
        room[5].getElementsByTagName('a')[0].textContent = "---大沙田(空闲)---"
    } else {
        room[5].getElementsByTagName('a')[0].textContent = "---大沙田(人满)---"
    }
    if (arr[6] < 4) {
        room[6].getElementsByTagName('a')[0].textContent = "--一号大道(空闲)--"
    } else {
        room[6].getElementsByTagName('a')[0].textContent = "--一号大道(人满)--"
    }
    if (arr[7] < 4) {
        room[7].getElementsByTagName('a')[0].textContent = "--九龙瀑布(空闲)--"
    } else {
        room[7].getElementsByTagName('a')[0].textContent = "--九龙瀑布(人满)--"
    }
    if (arr[8] < 4) {
        room[8].getElementsByTagName('a')[0].textContent = "--莲州公路(空闲)--"
    } else {
        room[8].getElementsByTagName('a')[0].textContent = "--莲州公路(人满)--"
    }

}




//clieck button to exit from game
function exitGames() {
    socket.emit("exitGame");
    document.getElementById("exitGame").style.display = "none";
    document.getElementById("chooseTables").style.display = "inline"
}



function readyFunc() {
    $("#error-container").html(""); //might need to delete
    var name = document.getElementById("signUp-uname").value
    var password = document.getElementById("signUp-psw").value

    if (name && password) {
        socket.emit("signIn", { username: name, password: password });
    } else {
        $("#error-container").html("请输入完整的用户名或密码")
    }
};

//confirm who is zhuangJia

function zhuangJiaCon() {
    mySound.set("/sounds/click.mp3")
    socket.emit('zhuangJia')

}

//chat function

function sendMessage() {
    var msg = document.getElementById('message').value;
    if (msg) {
        socket.emit('msg', { message: msg, user: user });
        document.getElementById('message').value = "";
    }
}
//enbale enter key release to emit event       
function handle(e) {
    if (e.keyCode === 13) {
        e.preventDefault(); // Ensure it is only this code that rusn
        var msg = document.getElementById('message').value;
        if (msg) {
            socket.emit('msg', { message: msg, user: user });
            document.getElementById('message').value = "";
        }
    }
}




function InterruptHide(name) {
    if (name) {
        document.getElementById("exit").children[0].innerHTML = name + "离开游戏，游戏暂停。"
        $(document).ready(function () {
            $("#exit").fadeIn(3000).fadeOut(3000);
        });
    }
    setTimeout(function () { document.getElementById("chooseTables").style.display = "inline"; }, 3900);

    document.getElementById("exitGame").style.display = "none";
    document.getElementById('dialogbox').style.display = "none";
    document.getElementById("timer").style.visibility = "hidden";
    $(document).ready(function () {
        $("#table").remove();
        $("select").css("visibility", "hidden");
        $("select").prop("selectedIndex", "0")
        $("img").remove();
        $("h").html("");
        $(".playButton").css("visibility", "hidden");
    })

}


function loginTables() {

    var tableName = this.id.slice(0, -2);

    var TableID = this.id.slice(-2, -1);
    //exit or login
    var limit = this.id.slice(-1);
    if (this.id === "exitFromGame") {
        socket.emit("backToLounge")
    } else {
        socket.emit("connectToTable", { tableID: TableID, tableName: tableName, limit: limit });
    }

}
// deprecated function
/*socket.on('preventlogin', function(){
         document.getElementById('error-container').innerHTML ="你已经登陆过了，不要重复登录哦"
      });
      */


socket.on('signInResponse', function (data) {
    if (data.success) {
        $("#signUp-uname,#signUp-psw,#ready,#signUpReady").css("display", "none");
        $("#messages,#chat").css("visibility", "visible");
        if (data.points < 20) { var level = "低到看不清" }
        else if (data.points < 40) { var level = "小小水鱼" }
        else if (data.points < 60) { var level = "小水鱼" }
        else if (data.points < 80) { var level = "水鱼" }
        else if (data.points < 100) { var level = "大水鱼" }
        else { var level = "中华鳖" }
        $("#welcome").html("欢迎: " + data.username + " 积分:" + data.points + " 等级:" + level);
        user = data.username;
        $("#error-container").html("");
        $("#chooseTables").css("display", "inline");
    } else {
        $("#signUp-uname,#signUp-psw").val("");
        $("#error-container").html("用户名或密码输入不正确，请重新登录");
    }
})

socket.on('signUpResponse', function (data) {
    if (data.success) {
        $("#myProgress").css("display", "block")
        var elem = document.getElementById("myBar");
        var width = 10;
        var id = setInterval(frame, 10);
        function frame() {
            if (width >= 100) {
                clearInterval(id);
                $("#myProgress").css("display", "none")
                $("#signUp-uname,#signUp-psw,#ready,#signUpReady").css("display", "none");
                $("#messages,#chat").css("visibility", "visible");
                if (data.points < 20) { var level = "低到看不清" }
                else if (data.points < 40) { var level = "小小水鱼" }
                else if (data.points < 60) { var level = "小水鱼" }
                else if (data.points < 80) { var level = "水鱼" }
                else if (data.points < 100) { var level = "大水鱼" }
                else { var level = "中华鳖" }
                $("#welcome").html("欢迎: " + data.username + " 积分:" + data.points + " 等级:" + level);
                user = data.username;
                $("#error-container").html("");
                $("#chooseTables").css("display", "inline");
            } else {
                width++;
                elem.style.width = width + '%';
                elem.innerHTML = width * 1 + '%';
            }
        }
    } else {
        $("#signUp-uname,#signUp-psw").val("");
        $("#error-container").html("此用户名已存在，请重新注册");
    }
})


socket.on('userExists', function (data) {
    // document.getElementById("signUp-uname").style.display = ""
    // document.getElementById("chooseTables").style.display="none"
    document.getElementById("signUp-uname").value = ""
    // document.getElementById("ready").style.display = "";  
    document.getElementById('error-container').innerHTML = data;
});
socket.on('userSet', function (data) {
    var player = document.getElementById("signUp-uname").value
    document.getElementById("messages").style.visibility = "visible"
    document.getElementById("ready").style.display = "none";
    document.getElementById("signUp-uname").style.display = "none"
    document.getElementById("welcome").innerHTML = "欢迎: " + player
    document.getElementById('error-container').innerHTML = ""
    user = data.username;
    document.getElementById("chooseTables").style.display = "inline";
    document.getElementById("chat").style.visibility = "visible"
});

//chatting received
socket.on('newmsg', function (data) {
    if (user) {
        document.getElementById('message-container').innerHTML += '<div><b>' + data.user + '</b>: ' + data.message + '</div>'
        updateScrollForChat(); //keep message shown upated, auto scroll down 
    }
})

//this needs to be modified as to scroll-able
socket.on("logging", function (data) {

    document.getElementById("messages").innerHTML += '<div>' + data.message + '</div>'
    updateScrollForLogging();
});


socket.on("newRound", function (data) {
    statusD = [];
    document.getElementById("timer").style.visibility = "visible";
    document.getElementById("counter").innerHTML = "游戏会在" + data.countdown + "秒后开始";
    document.getElementById("chooseTables").style.display = "none"
    document.getElementById("exitGame").style.display = "";
    if (!data.display) {
        document.getElementById("zhuangJia").style.visibility = "hidden";
    } else if (data.display && data.countdown === 5) {
        document.getElementById("zhuangJia").style.visibility = "visible";
    }
    if (data.countdown === 0) {
        socket.emit("readyToPlay")
        //socket.emit("readyToPlay", {tableID: 1}); not necessary,we can get the table ID from table
        document.getElementById("timer").style.visibility = "hidden";
        document.getElementById("zhuangJia").style.visibility = "hidden";
        var cards = document.querySelectorAll('.card');
        [].forEach.call(cards, function (card) {
            card.addEventListener('dragstart', handleDragStart, false);
            card.addEventListener('dragenter', handleDragEnter, false)
            card.addEventListener('dragover', handleDragOver, false);
            card.addEventListener('dragleave', handleDragLeave, false);
            card.addEventListener('drop', handleDrop, false);
            card.addEventListener('dragend', handleDragEnd, false);
        })
        //hideCards();//duplicatehide

    }
})

socket.on("displayNames", function (data) {

    hideCards(data.names);
    displayNames(data.names, data.zhuangName)



});


socket.on("tableFull", function () {

    document.getElementById('error-container').innerHTML = "本桌玩家已满，请稍候或去其他游戏桌"
    document.getElementById("chooseTables").style.display = "inline"

})

socket.on("clearError", function () {

    document.getElementById('error-container').innerHTML = ""
})

socket.on("originalHand", function (data) {

    showCards(data.hand);
    checkLaiZi(data.hand)
    document.getElementById("buildCards").style.visibility = "visible";
});

socket.on("preventDupliZhuang", function (data) {
    document.getElementById("zhuangJia").style.visibility = "hidden";
})


socket.on("xianTurn", function () {
    document.getElementById("coverCard").style.visibility = "visible";
    document.getElementById("showCard").style.visibility = "visible";
    document.getElementById("forceAttack").style.visibility = "visible";

});

socket.on("zhuangConfirmationForZhuangShuiZha", function (data) {
    ZhuangConShuiZha.render("你拿到了水鱼或炸弹，现在和闲家" + data.xianJia + "比大小。")
});

socket.on("xianConfirmationForZhuangShuiZha", function (data) {
    XianConShuiZha.render("庄家" + data.zhuangJia + "拿到了水鱼或炸弹，现在开牌比大小。")
    $("#dialogbox").fadeIn(3000).fadeOut(3000);
});

socket.on("zhuangConfirmationForXianShuiZha", function (data) {
    ZhuangConShuiZha.render("闲家" + data.xianJia + "拿到了水鱼或炸弹，开牌比大小。")
});

socket.on("xianConfirmationForXianShuiZha", function (data) {
    XianConShuiZha.render("你拿到了水鱼或炸弹，现在跟庄家" + data.zhuangJia + "比大小。")
    $("#dialogbox").fadeIn(3000).fadeOut(3000);
});


socket.on("zhuangDecisionForXianCover", function (data) {

    Confirm.render(data.xianJia + "盖牌喔，庄家你怎么看？")
});

socket.on("zhuangDecisionForXianQiangGong", function (data) {
    QiangGongConfirm.render(data.xianJia + "强攻喔，庄家你怎么看？")
});

socket.on("zhuangDecisionForXianUnCover", function (data) {
    ZhuangConfirm.render(data.xianJia + "开牌喔，庄家你怎么看？")
});

socket.on("xianTurnForUnCoverCardsZhuangSha", function (data) {
    ZhuangShaXian.render(data.name + "执意要杀喔，闲家你怎么看？")
});

socket.on("xianTurnForUnCoverCardsZhuangZouShui", function (data) {
    ZhuangZouShui.render(data.name + "想走水喔，闲家你怎么看？")
});

socket.on("qiangGongShowCards", function (data) {
    showQiangGongCards(data.playerName, data.cards)

});


socket.on("unCoverCards", function (data) {
    showOthersCards(data.playerName, data.cards)

});

socket.on("ranking", function (data) {
    //document.getElementById("table").style.visibility = "visible";
    displayRanking(data.ranking)
});

socket.on("statusData", function (data) {
    statusD.push(data)
});

socket.on("drankCupsDisplay", function (data) {
    showDrankCups(data.drankCups)
});


socket.on("interruption", function (data) {

    if (data) {
        InterruptHide(data.name);
    } else {
        InterruptHide();
    }

});

// realtime display room vacancies
socket.on("displayVacancies", function (data) {

    displayRoomVacan(data.number)


});


$(document).ready(function () {
    $('.dropdown-submenu a.test').on("click", function (e) {
        $(this).next('ul').toggle();
        e.stopPropagation();
        e.preventDefault();
    });
});

// double drop down

// double drop down


//auto scroll down chat box    
function updateScrollForChat() {
    var element = document.getElementById("message-container");
    element.scrollTop = element.scrollHeight;
}

function updateScrollForLogging() {
    var element = document.getElementById("messages");
    element.scrollTop = element.scrollHeight;
}

//modal signup form
window.onclick = function (event) {
    var modal = document.getElementById('id01');
    if (event.target == modal) {
        $("#id01").css("display", "none");
    }
} 

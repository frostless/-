Table = require('./table.js');
Player=require('./player.js');

 module.exports = {checkCardStatus: function(hand) {
 	var cardStatus = {};
 	
   var card1 = Number(parseInt(hand[0]))
 	var card2 = Number(parseInt(hand[1]))
 	var card3 = Number(parseInt(hand[2]))
 	var card4 = Number(parseInt(hand[3]))
 	
 	var card1Full = Number(hand[0])
 	 if (card1Full<2) {card1Full = card1Full + 14}
 	var card2Full = Number(hand[1])
 	 if (card2Full<2) {card2Full = card2Full + 14}   
 	var card3Full = Number(hand[2])
 	 if (card3Full<2) {card3Full = card3Full + 14} 
 	var card4Full = Number(hand[3])
 	 if (card4Full<2) {card4Full = card4Full + 14}
 	
 	var cardArr = [card1,card2,card3,card4]
          for (var i =0 ;i <= 4; i++) {if (cardArr[i] >= 10 )
                 {cardArr[i] = 0}  }
 	
 	if (card1===card2&&card1===card3&&card1===card4){
 		cardStatus.status= "zhaDan"
 		cardStatus.big= card1Full
 		cardStatus.small= card1Full
 	  } else if (card1===card2&&card3===card4){
 		cardStatus.status= "shuiYu"
 		cardStatus.big=Math.max(card1Full,card2Full,card3Full,card4Full)
 		cardStatus.small=Math.min(card1,card3)
 	 }else if ((cardArr[0]+cardArr[1])%10 <0.5&&(cardArr[2]+cardArr[3])%10 <0.5&&card1!==card2&&card3!==card4){
 	 	cardStatus.status= "maMa"
 		cardStatus.big=Math.max(card1Full,card2Full,card3Full,card4Full)
 		cardStatus.small=0
 	 } else if(card1===card2&&card3!==card4){
 	 	cardStatus.status= "bao"
 		cardStatus.big=Math.max(card1Full,card2Full)
 		cardStatus.small=Number((cardArr[2]+cardArr[3])%10)  
 		 cardStatus.baoSmallBig =Math.max(card3Full,card4Full)
 	 } else if (card3===card4&&card1!==card2){
 	 	cardStatus.status= "bao"
 		cardStatus.big=Math.max(card3Full,card4Full)
 		cardStatus.small=Number((cardArr[0]+cardArr[1])%10)  
 		 cardStatus.baoSmallBig =Math.max(card1Full,card2Full)
 	 } else if (card1!==card2&&card3!==card4){
 	 	var left = Number((cardArr[0]+cardArr[1])%10)
 	 	var right = Number((cardArr[2]+cardArr[3])%10)  
 	 	cardStatus.status= "none"
 	 	if (left >right) {
 		cardStatus.big=left
 		cardStatus.small=right
 		cardStatus.noneBigBig =Math.max(card1Full,card2Full)
 		 cardStatus.noneSmallBig =Math.max(card3Full,card4Full)
 		}else if (left < right) {
 		cardStatus.big= right
 		cardStatus.small= left 
 		 cardStatus.noneBigBig =Math.max(card3Full,card4Full)
 		 cardStatus.noneSmallBig =Math.max(card1Full,card2Full)
 		  }
 		  else if (left === right){
 		   if (Math.max(card1Full,card2Full) >= Math.max(card3Full,card4Full)) {
 		       	cardStatus.big=left
 		        cardStatus.small=right
 		        cardStatus.noneBigBig =Math.max(card1Full,card2Full)
 		        cardStatus.noneSmallBig =Math.max(card3Full,card4Full)
 		  		 } else if (Math.max(card1Full,card2Full)  < Math.max(card3Full,card4Full)){
 		        	cardStatus.big=left
 		           cardStatus.small=right
 		          cardStatus.noneBigBig =Math.max(card3Full,card4Full)
 		          cardStatus.noneSmallBig =Math.max(card1Full,card2Full)
 		   }
 		  }
 	 }
 	
 	return cardStatus;
 	
 },
 	xianWinOneSide: function(zhuangCardStatus,xianCardStatus,zhuang,xian){
 	   var result={}
 		
 		if (zhuangCardStatus.status=== "zhaDan"&& xianCardStatus.status!=="zhaDan"){
 			result.zhuangWins = 1
 			result.zhuangLoss = 0
 			result.zhuangDrankCups = 0
 			result.xianWins = 0
 			result.xianLoss = 1
 			result.xianDrankCups = 3
 			result.comment="庄家" + zhuang + "炸弹，闲家" + xian + "母有炸弹，梗系闲家饮啦，3杯"
 			result.commentToZhuang="你有炸弹，闲家" + xian + "母有炸弹，梗系" + xian +"饮啦，3杯"
 			result.commentToXian="庄家" + zhuang + "炸弹，你母有炸弹，梗系你饮啦，3杯"
 		  }  else if (xianCardStatus.status=== "zhaDan"&& zhuangCardStatus.status!=="zhaDan"){
 			result.zhuangWins = 0
 			result.zhuangLoss = 1
 			result.zhuangDrankCups = 3
 			result.xianWins = 1
 			result.xianLoss = 0
 			result.xianDrankCups = 0
 			result.comment="闲家" +  xian + "炸弹，庄家" +  zhuang + "母有炸弹，梗系庄家饮啦，3杯"
 			result.commentToZhuang="闲家" +  xian + "炸弹，你母有炸弹，梗系你饮啦，3杯"
 			result.commentToXian="你有炸弹，庄家" + zhuang + "母有炸弹，梗系" + zhuang + "饮啦，3杯"
 	     	}  else if (zhuangCardStatus.status=== "zhaDan"&& xianCardStatus.status==="zhaDan"&&xianCardStatus.big>zhuangCardStatus.big){
 			result.zhuangWins = 0
 			result.zhuangLoss = 1
 			result.zhuangDrankCups = 5
 			result.xianWins = 1
 			result.xianLoss = 0
 			result.xianDrankCups = 0
 			result.comment="闲家" +  xian + "炸弹大过庄家" + zhuang + "的炸弹，庄家衰滴啦，饮5杯"
 			result.commentToZhuang="闲家" +  xian + "炸弹大过你，你饮呕戳了，饮5杯"
 			result.commentToXian="你炸弹大过庄家" +  zhuang + "的炸弹，" + zhuang +"绝对饮呕啦，饮5杯"
 			} else if (zhuangCardStatus.status=== "zhaDan"&& xianCardStatus.status==="zhaDan"&&zhuangCardStatus.big>xianCardStatus.big){
 			result.zhuangWins = 1
 			result.zhuangLoss = 0
 			result.zhuangDrankCups = 0
 			result.xianWins = 0
 			result.xianLoss = 1
 			result.xianDrankCups = 5
 			result.comment="闲家" +  xian + "炸弹大过庄家" +  zhuang + "炸弹，庄家衰滴啦，饮5杯"
 			result.commentToZhuang="你炸弹大过闲家" + xian + "的炸弹，" + xian + "准备呕啦，饮5杯"
 			result.commentToXian="庄家" +  zhuang + "炸弹大过你，你咩米？饮5杯"
 			}else if (zhuangCardStatus.status==="shuiYu"&&xianCardStatus.status!=="shuiYu"&&xianCardStatus.status!=="maMa"){
 	     	result.zhuangWins = 1
 			result.zhuangLoss = 0
 			result.zhuangDrankCups = 0
 			result.xianWins = 0
 			result.xianLoss = 1
 			result.xianDrankCups = 2
 			result.comment = "庄家" + zhuang + "有水鱼，闲家" + xian + "没有水鱼或麻麻，" + xian + "饮2杯"
 			result.commentToZhuang= "你有水鱼喔，闲家" + xian + "没有水鱼或麻麻，" + xian + "饮2杯"
 			result.commentToXian= "庄家" + zhuang + "有水鱼喔，" + "你没有水鱼或麻麻，你喝2杯"
 	     	} else if (xianCardStatus.status==="shuiYu"&&zhuangCardStatus.status!=="shuiYu"&&zhuangCardStatus.status!=="maMa"){
 	     	result.zhuangWins = 0
 			result.zhuangLoss = 1
 			result.zhuangDrankCups = 2
 			result.xianWins = 1
 			result.xianLoss = 0
 			result.xianDrankCups = 0
 			result.comment= "闲家" + xian + "有水鱼喔，庄家" + zhuang+ "母有麻麻，" + zhuang + "饮2杯"
 			result.commentToZhuang="闲家" + xian + "有水鱼喔，你母有麻麻，你饮2杯"
 			result.commentToXian= "你有水鱼喔，庄家"  + zhuang + "母有麻麻，" + zhuang +"饮2杯"
           } else if (zhuangCardStatus.status==="shuiYu"&&xianCardStatus.status==="shuiYu"&&xianCardStatus.big>zhuangCardStatus.big) {
 	     	result.zhuangWins = 0
 			result.zhuangLoss = 1
 			result.zhuangDrankCups = 4
 			result.xianWins = 1
 			result.xianLoss = 0
 			result.xianDrankCups = 0
 			result.comment="庄家" + zhuang + "同闲家" + xian + "都系水鱼，但系庄家水鱼母能杀闲家，庄家饮4杯"
 			result.commentToZhuang="你同闲家" + xian + "都系水鱼，但系" + xian+ "的水鱼大过你，你饮4杯"
 			result.commentToXian="庄家" + zhuang + "同你都系水鱼，但你水鱼大过" + zhuang +"的水鱼，"+ zhuang+"饮4杯"
 			}else if (zhuangCardStatus.status==="shuiYu"&&xianCardStatus.status==="shuiYu"&&xianCardStatus.big<zhuangCardStatus.big) {
 	     	result.zhuangWins = 1
 			result.zhuangLoss = 0
 			result.zhuangDrankCups = 0
 			result.xianWins = 0
 			result.xianLoss = 1
 			result.xianDrankCups = 4
 			result.comment="庄家" + zhuang + "水鱼大过闲家" + xian + "水鱼，闲家饮4杯"
 			result.commentToZhuang="你水鱼大过闲家" + xian + "的水鱼，" + xian + "饮4杯"
 			result.commentToXian="你水鱼母够庄家" + zhuang + "的水鱼大，你饮4杯"
 			}else if (zhuangCardStatus.status==="shuiYu"&&xianCardStatus.status==="maMa") {
 	     	result.zhuangWins = 0
 			result.zhuangLoss = 1
 			result.zhuangDrankCups = 3
 			result.xianWins = 1
 			result.xianLoss = 0
 			result.xianDrankCups = 0
 			result.comment="庄家" + zhuang + "水鱼喔，可惜闲家" + xian + "有麻麻，" + zhuang + "饮3杯"
 			result.commentToZhuang="你水鱼喔，可惜闲家" + xian + "有麻麻，你饮3杯"
 			result.commentToXian="庄家水鱼喔，但系你有麻麻，庄家饮3杯"
 			}else if (xianCardStatus.status==="shuiYu"&&zhuangCardStatus.status==="maMa"){
 			result.zhuangWins = 1
 			result.zhuangLoss = 0
 			result.zhuangDrankCups = 0
 			result.xianWins = 0
 			result.xianLoss = 1
 			result.xianDrankCups = 3
 			result.comment="闲家" + xian + "水鱼，但系可惜庄家" + zhuang + "有麻麻，闲家饮3杯"
 			result.commentToZhuang="闲家" + xian + "水鱼喔，可惜你有麻麻，闲家" + xian + "饮3杯"
 			result.commentToXian="你水鱼喔，可惜庄家" +zhuang + "有麻麻，你饮3杯"
 	     	} else if (xianCardStatus.status==="bao"&&zhuangCardStatus.status!=="bao"){
 	     	result.zhuangWins = 0
 			result.zhuangLoss = 1
 			result.zhuangDrankCups = 1
 			result.xianWins = 1
 			result.xianLoss = 0
 			result.xianDrankCups = 0
 			result.comment="闲家" +xian + "有宝，庄家" + zhuang+ "母有，庄家饮1杯"
 			result.commentToZhuang="闲家" + xian +"有宝，你黑宝，你饮1杯"
 			result.commentToXian="你有宝，庄家" + zhuang + "黑宝，" + zhuang + "饮1杯"
 	     	} else if (zhuangCardStatus.status==="bao"&&xianCardStatus.status==="bao"&&xianCardStatus.big>zhuangCardStatus.big)  {
 	     	result.zhuangWins = 0
 			result.zhuangLoss = 1
 			result.zhuangDrankCups = 1
 			result.xianWins = 1
 			result.xianLoss = 0
 			result.xianDrankCups = 0
 			result.comment= "闲家" + xian  + "只宝大过庄家" + zhuang+ "只宝，庄家饮1杯"
 			result.commentToZhuang= "闲家" + xian + "只宝大过你只宝，你饮1杯"
 			result.commentToXian="你只宝大过庄家" + zhuang + "只宝，"+ zhuang+ "饮1杯"
 	     	} else if ((zhuangCardStatus.status==="bao"&&xianCardStatus.status==="bao"&&xianCardStatus.big<zhuangCardStatus.big&&xianCardStatus.small>zhuangCardStatus.small) ||(zhuangCardStatus.status==="bao"&&xianCardStatus.status==="bao"&&xianCardStatus.big<zhuangCardStatus.big&&xianCardStatus.small===zhuangCardStatus.small &&xianCardStatus.baoSmallBig>zhuangCardStatus.baoSmallBig ))  {
 	     	 result.zhuangWins = 0
 			result.zhuangLoss = 1
 			result.zhuangDrankCups = 1
 			result.xianWins = 1
 			result.xianLoss = 0
 			result.xianDrankCups = 0
 			result.comment="庄家" + zhuang + "只宝大过闲家" + xian + "只保，但系庄家小对细过闲家小对，庄家饮1杯"
 			result.commentToZhuang="闲家" + xian + "只宝细过你只宝，但系佢小对大过你小对，你饮1杯"
 			result.commentToXian="你只宝细过庄家" + zhuang +"只宝，但系你小对大过" +zhuang + "小对，"+zhuang + "饮1杯"
 	     	}else if ((xianCardStatus.status!=="bao"&&zhuangCardStatus.status==="bao"&&xianCardStatus.small>zhuangCardStatus.small) || (xianCardStatus.status!=="bao"&&zhuangCardStatus.status==="bao"&&xianCardStatus.small===zhuangCardStatus.small&&xianCardStatus.noneSmallBig>zhuangCardStatus.baoSmallBig))  {
 	     	  result.zhuangWins = 0
 		 	  result.zhuangLoss = 1
 			  result.zhuangDrankCups = 1
 			  result.xianWins = 1
 			  result.xianLoss = 0
 			  result.xianDrankCups = 0
 	     	 result. comment="闲家" +xian + "母有宝，庄家" +zhuang + "有宝，但系庄家小对细过闲家小对，庄家饮1杯"
 	     	 result.commentToZhuang="你有宝，闲家" + xian + "母有宝，但系" + xian + "小对大过你小对，你饮1杯"
 			 result.commentToXian="庄家" + zhuang + "有宝，你母有宝，但系你小对大过" + zhuang + "小对，"+ zhuang + "饮1杯"
 	     	 }else if((zhuangCardStatus.status!=="bao"&&xianCardStatus.status!=="bao"&&xianCardStatus.big>zhuangCardStatus.big)||(zhuangCardStatus.status!=="bao"&&xianCardStatus.status!=="bao"&&xianCardStatus.big===zhuangCardStatus.big&&xianCardStatus.noneBigBig>zhuangCardStatus.noneBigBig)){
 	     	  result.zhuangWins = 0
 		 	  result.zhuangLoss = 1
 			  result.zhuangDrankCups = 1
 			  result.xianWins = 1
 			  result.xianLoss = 0
 			  result.xianDrankCups = 0
 	     	 result. comment="庄家" + zhuang + "同闲家" + xian + "都母有宝，但系庄家两对母能双杀闲家两对，庄家饮1杯"
 	     	 result.commentToZhuang="你同闲家" + xian + "都母有宝，但系你两对母能双杀"+ xian +"两对，你饮1杯"
 			 result.commentToXian="庄家" +  zhuang + "同你都母有宝，但系" + zhuang + "两对母能双杀你两对，"+ zhuang + "饮1杯"
 	     	 }else if ((zhuangCardStatus.status!=="bao"&&xianCardStatus.status!=="bao"&&xianCardStatus.small>zhuangCardStatus.small)||(zhuangCardStatus.status!=="bao"&&xianCardStatus.status!=="bao"&&xianCardStatus.small===zhuangCardStatus.small&&xianCardStatus.noneSmallBig>zhuangCardStatus.noneSmallBig)){
 	     	  result.zhuangWins = 0
 		 	  result.zhuangLoss = 1
 			  result.zhuangDrankCups = 1
 			  result.xianWins = 1
 			  result.xianLoss = 0
 			  result.xianDrankCups = 0
 	     	  result. comment="庄家" + zhuang + "同闲家" + xian + "都母有宝，但系庄家两对母能双杀闲家两对，庄家饮1杯"
 	     	 result.commentToZhuang="你同闲家" + xian + "都母有宝，但系你两对母能双杀"+ xian +"两对，你饮1杯"
 			 result.commentToXian="庄家" +  zhuang + "同你都母有宝，但系" + zhuang + "两对母能双杀你两对，"+ zhuang + "饮1杯"
 	     	 }else {
 	     	   result.zhuangWins = 1
 		 	   result.zhuangLoss = 0
 			   result.zhuangDrankCups = 0
 			   result.xianWins = 0
 			   result.xianLoss = 1
 			   result.xianDrankCups = 1
 	     	   result. comment="庄家" +  zhuang + "两对双杀闲家" +  xian+ "两对，闲家饮1杯"
 	     	   result.commentToZhuang="你两对双杀闲家" +  xian + "两对，" +  xian + "饮1杯"
 			  result.commentToXian="庄家" +  zhuang + "两对双杀你两对，你饮1杯"
 	     	  
 	     	 }
 		
 		return result;
 		
 	},
 	
 	updateGameStaus: function(zhuangJia,xianJia,result){
 	   zhuangJia.wins=Number(zhuangJia.wins)+Number(result.zhuangWins)
 	   zhuangJia.loss=Number(zhuangJia.loss)+Number(result.zhuangLoss)
 	   zhuangJia.drankCups=Number(zhuangJia.drankCups)+Number(result.zhuangDrankCups)
 	   xianJia.wins=Number(xianJia.wins)+Number(result.xianWins)
 	   xianJia.loss=Number(xianJia.loss)+Number(result.xianLoss)
 	   xianJia.drankCups=Number(xianJia.drankCups)+Number(result.xianDrankCups)
 	  },
 	  
 	  zhuangWinOneSide: function(zhuangCardStatus,xianCardStatus,zhuang,xian){
 	   var result={}
 		
 		if (zhuangCardStatus.status=== "zhaDan"&& xianCardStatus.status!=="zhaDan"){
 			result.zhuangWins = 1
 			result.zhuangLoss = 0
 			result.zhuangDrankCups = 0
 			result.xianWins = 0
 			result.xianLoss = 1
 			result.xianDrankCups = 3
 			result.comment="庄家" + zhuang + "有炸弹，闲家" +  xian + "母有炸弹，梗系闲家饮啦，3杯"
 			result.commentToZhuang="你有炸弹，闲家" + xian + "母有炸弹，梗系" + xian + "饮啦，3杯"
 			result.commentToXian="庄家" + zhuang + "有炸弹，你母有炸弹，梗系你饮啦，3杯"
 		  }  else if (xianCardStatus.status=== "zhaDan"&& zhuangCardStatus.status!=="zhaDan"){
 			result.zhuangWins = 0
 			result.zhuangLoss = 1
 			result.zhuangDrankCups = 3
 			result.xianWins = 1
 			result.xianLoss = 0
 			result.xianDrankCups = 0
 			result.comment="闲家" + xian + "有炸弹，庄家" +  zhuang + "母有炸弹，梗系庄家饮啦，3杯"
 			result.commentToZhuang="闲家" + xian + "有炸弹，你母有炸弹，梗系你饮啦，3杯"
 			result.commentToXian="你有炸弹，庄家" +  zhuang + "母有炸弹，梗系" +  zhuang + "饮啦，3杯"
 	     	}  else if (zhuangCardStatus.status=== "zhaDan"&& xianCardStatus.status==="zhaDan"&&zhuangCardStatus.big>xianCardStatus.big){
 			result.zhuangWins = 1
 			result.zhuangLoss = 0
 			result.zhuangDrankCups = 0
 			result.xianWins = 0
 			result.xianLoss = 1
 			result.xianDrankCups = 5
 			result.comment="庄家" + zhuang + "炸弹大过闲家"+ xian+"的炸弹，闲家衰滴啦，饮5杯"
 			result.commentToZhuang="你炸弹大过闲家" + xian + "的炸弹，闲家衰滴啦，饮5杯"
 			result.commentToXian="庄家" + zhuang + "炸弹大过你的炸弹，你衰滴啦，饮5杯"
 			} else if (zhuangCardStatus.status=== "zhaDan"&& xianCardStatus.status==="zhaDan"&&xianCardStatus.big>zhuangCardStatus.big){
 			result.zhuangWins = 0
 			result.zhuangLoss = 1
 			result.zhuangDrankCups = 5
 			result.xianWins = 1
 			result.xianLoss = 0
 			result.xianDrankCups = 0
 			result.comment="闲家" + xian + "的炸弹大过庄家" + zhuang + "的炸弹，庄家衰滴啦，饮5杯"
 			result.commentToZhuang="闲家" +  xian + "的炸弹大过你的炸弹，你衰滴啦，饮5杯"
 			result.commentToXian="你炸弹大过庄家" +  zhuang + "的炸弹，"+ zhuang + "衰滴啦，饮5杯"
 			}else if (zhuangCardStatus.status==="shuiYu"&&xianCardStatus.status!=="shuiYu"&&xianCardStatus.status!=="maMa"){
 	     	result.zhuangWins = 1
 			result.zhuangLoss = 0
 			result.zhuangDrankCups = 0
 			result.xianWins = 0
 			result.xianLoss = 1
 			result.xianDrankCups = 2
 			result.comment="庄家" +  zhuang + "水鱼喔，闲家"+ xian + "母有水鱼或麻麻，闲家饮2杯"
 			result.commentToZhuang="你水鱼喔，闲家" + xian + "母有水鱼或麻麻，闲家" +  xian + "饮2杯"
 			result.commentToXian="庄家" + zhuang + "水鱼喔，你母有水鱼或麻麻，你饮2杯"
 	     	} else if (xianCardStatus.status==="shuiYu"&&zhuangCardStatus.status!=="shuiYu"&&zhuangCardStatus.status!=="maMa"){
 	     	result.zhuangWins = 0
 			result.zhuangLoss = 1
 			result.zhuangDrankCups = 2
 			result.xianWins = 1
 			result.xianLoss = 0
 			result.xianDrankCups = 0
 			result.comment="闲家" + xian + "水鱼喔，庄家" +  zhuang + "母有麻麻，庄家饮2杯"
 			result.commentToZhuang="闲家" +  xian + "水鱼喔，你母有水鱼或麻麻，你饮2杯"
 			result.commentToXian="你水鱼喔，庄家" + zhuang + "母有水鱼或麻麻，" + zhuang +"饮2杯"
           } else if (zhuangCardStatus.status==="shuiYu"&&xianCardStatus.status==="shuiYu"&&zhuangCardStatus.big>xianCardStatus.big) {
 	     	result.zhuangWins = 1
 			result.zhuangLoss = 0
 			result.zhuangDrankCups = 0
 			result.xianWins = 0
 			result.xianLoss = 1
 			result.xianDrankCups = 4
 			result.comment="庄家" + zhuang + "闲家" +  xian + "都系水鱼，但系闲家水鱼母能双杀庄家，闲家饮4杯"
 			result.commentToZhuang="你同闲家" +  xian + "都系水鱼，但系" + xian + "水鱼母能双杀你，" + xian + "饮4杯"
 			result.commentToXian="庄家" +  zhuang + "同你都系水鱼，但系你水鱼母能双杀" + zhuang + "，你饮4杯"
 			}else if (zhuangCardStatus.status==="shuiYu"&&xianCardStatus.status==="shuiYu"&&zhuangCardStatus.big<xianCardStatus.big) {
 	     	result.zhuangWins = 0
 			result.zhuangLoss = 1
 			result.zhuangDrankCups = 4
 			result.xianWins = 1
 			result.xianLoss = 0
 			result.xianDrankCups = 0
 			result.comment="闲家" +  xian + "水鱼双杀庄家" +  zhuang + "水鱼，庄家饮4杯"
 			result.commentToZhuang="闲家" +  xian + "水鱼双杀你水鱼，你饮4杯"
 			result.commentToXian="你水鱼双杀庄家" +  zhuang + "水鱼，" + zhuang + "饮4杯"
 			}else if (zhuangCardStatus.status==="shuiYu"&&xianCardStatus.status==="maMa") {
 	     	result.zhuangWins = 0
 			result.zhuangLoss = 1
 			result.zhuangDrankCups = 3
 			result.xianWins = 1
 			result.xianLoss = 0
 			result.xianDrankCups = 0
 			result.comment="庄家" +  zhuang + "水鱼喔，可惜闲家" +  xian + "有麻麻，庄家饮3杯"
 			result.commentToZhuang="你水鱼喔，可惜闲家" +  xian + "有麻麻，你饮3杯"
 			result.commentToXian="庄家" +  zhuang + "水鱼喔，但系你有麻麻，" + zhuang + "饮3杯"
 			}else if (xianCardStatus.status==="shuiYu"&&zhuangCardStatus.status==="maMa"){
 			result.zhuangWins = 1
 			result.zhuangLoss = 0
 			result.zhuangDrankCups = 0
 			result.xianWins = 0
 			result.xianLoss = 1
 			result.xianDrankCups = 3	
 			result.comment="闲家" +  xian + "水鱼喔，可惜庄家" + zhuang +" 有麻麻，闲家饮3杯"
 			result.commentToZhuang="闲家" +  xian + "水鱼喔，可惜你有麻麻，" + xian + "饮3杯"
 			result.commentToXian="你水鱼喔，可惜庄家"+ zhuang + "有麻麻，你饮3杯"
 	     	} else if (zhuangCardStatus.status==="bao"&&xianCardStatus.status!=="bao"){
 	     	result.zhuangWins = 1
 			result.zhuangLoss = 0
 			result.zhuangDrankCups = 0
 			result.xianWins = 0
 			result.xianLoss = 1
 			result.xianDrankCups = 1
 			result.comment="庄家" +  zhuang + "有宝，闲家" +  xian + "母有，闲家饮1杯"
 			result.commentToZhuang="你有宝，闲家" +  xian + "母有宝，" + xian + "饮1杯"
 			result.commentToXian="庄家" + zhuang + "有宝，你母有，你饮1杯"
 	     	} else if (zhuangCardStatus.status==="bao"&&xianCardStatus.status==="bao"&&zhuangCardStatus.big>xianCardStatus.big) {
 	     	result.zhuangWins = 1
 			result.zhuangLoss = 0
 			result.zhuangDrankCups = 0
 			result.xianWins = 0
 			result.xianLoss = 1
 			result.xianDrankCups = 1
 			result.comment="庄家" + zhuang + "有宝，闲家" + xian + "亦有宝，庄家宝大于闲家宝，闲家饮1杯"
 			result.commentToZhuang="你有宝，闲家" + xian + "亦有宝，你只宝大，" +  xian + "饮1杯"
 			result.commentToXian="庄家" +  zhuang + " 有宝，你亦有宝，但系你只宝细，你饮1杯"
 	     	} else if ((zhuangCardStatus.status==="bao"&&xianCardStatus.status==="bao"&&zhuangCardStatus.big<xianCardStatus.big&&zhuangCardStatus.small>xianCardStatus.small) || (zhuangCardStatus.status==="bao"&&xianCardStatus.status==="bao"&&zhuangCardStatus.big<xianCardStatus.big&&zhuangCardStatus.small===xianCardStatus.small&&zhuangCardStatus.baoSmallBig>xianCardStatus.baoSmallBig)){
 	     	result.zhuangWins = 1
 			result.zhuangLoss = 0
 			result.zhuangDrankCups = 0
 			result.xianWins = 0
 			result.xianLoss = 1
 			result.xianDrankCups = 1
 			result.comment="庄家" + zhuang + "宝细过闲家" + xian + "宝，但庄家小对大于闲家小对，闲家饮1杯"
 			result.commentToZhuang="你宝细过闲家" + xian + "宝，但你小对大，" +  xian + "饮1杯"
 			result.commentToXian="庄家" +  zhuang + " 宝细过你只宝，但系你只小对细，你饮1杯"
 	     	}  else if ((zhuangCardStatus.status!=="bao"&&xianCardStatus.status==="bao"&&zhuangCardStatus.small>xianCardStatus.small) || (zhuangCardStatus.status!=="bao"&&xianCardStatus.status==="bao"&&zhuangCardStatus.small===xianCardStatus.small&&zhuangCardStatus.noneSmallBig>xianCardStatus.baoSmallBig)){
 	     	  result.zhuangWins = 1
 		 	  result.zhuangLoss = 0
 			  result.zhuangDrankCups = 0
 			  result.xianWins = 0
 			  result.xianLoss = 1
 			  result.xianDrankCups = 1
 	     	 result. comment="庄家" + zhuang + "母有宝，闲家" +  xian + "有宝，但系闲家小对细过庄家小对，闲家饮1杯"
 	     	 result.commentToZhuang="你母有宝，闲家" +  xian + "有宝，但系闲家小对细过你小对，" + xian + "饮1杯"
 			 result.commentToXian="庄家" +  zhuang + "母有宝，你有宝，但系你小对细过" + zhuang + "小对，你饮1杯"
 	     	 }else if((zhuangCardStatus.status!=="bao"&&xianCardStatus.status!=="bao"&&zhuangCardStatus.big>xianCardStatus.big)||(zhuangCardStatus.status!=="bao"&&xianCardStatus.status!=="bao"&&zhuangCardStatus.big===xianCardStatus.big&&zhuangCardStatus.noneBigBig>xianCardStatus.noneBigBig )){
 	     	  result.zhuangWins = 1
 		 	  result.zhuangLoss = 0
 			  result.zhuangDrankCups = 0
 			  result.xianWins = 0
 			  result.xianLoss = 1
 			  result.xianDrankCups = 1
 	     	 result. comment="庄家" + zhuang + "闲家" + xian + "都母有宝，但系闲家两对母能双杀庄家两对，闲家饮1杯"
 	     	 result.commentToZhuang="你同闲家" + xian + "都母有宝，但系" + xian + "两对母能双杀你两对，" + xian + "饮1杯"
 			 result.commentToXian="庄家" +  zhuang + "同你都母有宝，但系你两对母能双杀" + zhuang + "两对，你饮1杯"
 	     	 }else if((zhuangCardStatus.status!=="bao"&&xianCardStatus.status!=="bao"&&zhuangCardStatus.small>xianCardStatus.small)||(zhuangCardStatus.status!=="bao"&&xianCardStatus.status!=="bao"&&zhuangCardStatus.small===xianCardStatus.small&&zhuangCardStatus.noneSmallBig>xianCardStatus.noneSmallBig)){
 	     	  result.zhuangWins = 1
 		 	  result.zhuangLoss = 0
 			  result.zhuangDrankCups = 0
 			  result.xianWins = 0
 			  result.xianLoss = 1
 			  result.xianDrankCups = 1
 	     	 result. comment="庄家" + zhuang + "闲家" + xian + "都母有宝，但系闲家两对母能双杀庄家两对，闲家饮1杯"
 	     	 result.commentToZhuang="你同闲家" + xian + "都母有宝，但系" + xian + "两对母能双杀你两对，" + xian + "饮1杯"
 			 result.commentToXian="庄家" +  zhuang + "同你都母有宝，但系你两对母能双杀" + zhuang + "两对，你饮1杯"
 	     	 } else {
 	     	   result.zhuangWins = 0
 		 	   result.zhuangLoss = 1
 			   result.zhuangDrankCups = 1
 			   result.xianWins = 1
 			   result.xianLoss = 0
 			   result.xianDrankCups = 0
 	     	   result. comment="闲家" + xian + "两对双杀庄家" + zhuang + "两对，庄家饮1杯"
 	     	   result.commentToZhuang="闲家" + xian + "两对双杀你两对，你饮1杯"
 			  result.commentToXian="你两对双杀庄家" + zhuang + "两对，" + zhuang + "饮1杯"
 	     	  
 	     	 }
 		
 		return result;
 		
 	},
 	
 	xianQiangGong: function(zhuangCardStatus,xianCardStatus,zhuang,xian){
 	   var result={}
 		
 		if (zhuangCardStatus.status=== "zhaDan"&& xianCardStatus.status!=="zhaDan"){
 			result.zhuangWins = 1
 			result.zhuangLoss = 0
 			result.zhuangDrankCups = 0
 			result.xianWins = 0
 			result.xianLoss = 1
 			result.xianDrankCups = 3
 			result.comment="庄家" + zhuang + "有炸弹，闲家" +  xian + "母有炸弹，梗系闲家饮啦，3杯"
 			result.commentToZhuang="你有炸弹，闲家" + xian + "母有炸弹，梗系" + xian + "饮啦，3杯"
 			result.commentToXian="庄家" + zhuang + "有炸弹，你母有炸弹，梗系你饮啦，3杯"
 		  }  else if (xianCardStatus.status=== "zhaDan"&& zhuangCardStatus.status!=="zhaDan"){
 			result.zhuangWins = 0
 			result.zhuangLoss = 1
 			result.zhuangDrankCups = 3
 			result.xianWins = 1
 			result.xianLoss = 0
 			result.xianDrankCups = 0
 			result.comment="闲家" + xian + "有炸弹，庄家" +  zhuang + "母有炸弹，梗系庄家饮啦，3杯"
 			result.commentToZhuang="闲家" + xian + "有炸弹，你母有炸弹，梗系你饮啦，3杯"
 			result.commentToXian="你有炸弹，庄家" +  zhuang + "母有炸弹，梗系" +  zhuang + "饮啦，3杯"
 	     	}  else if (zhuangCardStatus.status=== "zhaDan"&& xianCardStatus.status==="zhaDan"&&zhuangCardStatus.big>xianCardStatus.big){
 			result.zhuangWins = 1
 			result.zhuangLoss = 0
 			result.zhuangDrankCups = 0
 			result.xianWins = 0
 			result.xianLoss = 1
 			result.xianDrankCups = 5
 			result.comment="庄家" + zhuang + "炸弹大过闲家"+ xian+"的炸弹，闲家衰滴啦，饮5杯"
 			result.commentToZhuang="你炸弹大过闲家" + xian + "的炸弹，闲家衰滴啦，饮5杯"
 			result.commentToXian="庄家" + zhuang + "炸弹大过你的炸弹，你衰滴啦，饮5杯"
 			} else if (zhuangCardStatus.status=== "zhaDan"&& xianCardStatus.status==="zhaDan"&&xianCardStatus.big>zhuangCardStatus.big){
 			result.zhuangWins = 0
 			result.zhuangLoss = 1
 			result.zhuangDrankCups = 5
 			result.xianWins = 1
 			result.xianLoss = 0
 			result.xianDrankCups = 0
 			result.comment="闲家" + xian + "的炸弹大过庄家" + zhuang + "的炸弹，庄家衰滴啦，饮5杯"
 			result.commentToZhuang="闲家" +  xian + "的炸弹大过你的炸弹，你衰滴啦，饮5杯"
 			result.commentToXian="你炸弹大过庄家" +  zhuang + "的炸弹，"+ zhuang + "衰滴啦，饮5杯"
 			}else if (zhuangCardStatus.status==="shuiYu"&&xianCardStatus.status!=="shuiYu"&&xianCardStatus.status!=="maMa"){
 	     	result.zhuangWins = 1
 			result.zhuangLoss = 0
 			result.zhuangDrankCups = 0
 			result.xianWins = 0
 			result.xianLoss = 1
 			result.xianDrankCups = 2
 			result.comment="庄家" +  zhuang + "水鱼喔，闲家"+ xian + "母有水鱼或麻麻，闲家饮2杯"
 			result.commentToZhuang="你水鱼喔，闲家" + xian + "母有水鱼或麻麻，闲家" +  xian + "饮2杯"
 			result.commentToXian="庄家" + zhuang + "水鱼喔，你母有水鱼或麻麻，你饮2杯"
 	     	} else if (xianCardStatus.status==="shuiYu"&&zhuangCardStatus.status!=="shuiYu"&&zhuangCardStatus.status!=="maMa"){
 	     	result.zhuangWins = 0
 			result.zhuangLoss = 1
 			result.zhuangDrankCups = 2
 			result.xianWins = 1
 			result.xianLoss = 0
 			result.xianDrankCups = 0
 			result.comment="闲家" + xian + "水鱼喔，庄家" +  zhuang + "母有麻麻，庄家饮2杯"
 			result.commentToZhuang="闲家" +  xian + "水鱼喔，你母有水鱼或麻麻，你饮2杯"
 			result.commentToXian="你水鱼喔，庄家" + zhuang + "母有水鱼或麻麻，" + zhuang +"饮2杯"
           } else if (zhuangCardStatus.status==="shuiYu"&&xianCardStatus.status==="shuiYu"&&zhuangCardStatus.big>xianCardStatus.big) {
 	     	result.zhuangWins = 1
 			result.zhuangLoss = 0
 			result.zhuangDrankCups = 0
 			result.xianWins = 0
 			result.xianLoss = 1
 			result.xianDrankCups = 4
 			result.comment="庄家" + zhuang + "闲家" +  xian + "都系水鱼，但系闲家水鱼母能双杀庄家，闲家饮4杯"
 			result.commentToZhuang="你同闲家" +  xian + "都系水鱼，但系" + xian + "水鱼母能双杀你，" + xian + "饮4杯"
 			result.commentToXian="庄家" +  zhuang + "同你都系水鱼，但系你水鱼母能双杀" + zhuang + "，你饮4杯"
 			}else if (zhuangCardStatus.status==="shuiYu"&&xianCardStatus.status==="shuiYu"&&zhuangCardStatus.big<xianCardStatus.big) {
 	     	result.zhuangWins = 0
 			result.zhuangLoss = 1
 			result.zhuangDrankCups = 4
 			result.xianWins = 1
 			result.xianLoss = 0
 			result.xianDrankCups = 0
 			result.comment="闲家" +  xian + "水鱼双杀庄家" +  zhuang + "水鱼，庄家饮4杯"
 			result.commentToZhuang="闲家" +  xian + "水鱼双杀你水鱼，你饮4杯"
 			result.commentToXian="你水鱼双杀庄家" +  zhuang + "水鱼，" + zhuang + "饮4杯"
 			}else if (zhuangCardStatus.status==="shuiYu"&&xianCardStatus.status==="maMa") {
 	     	result.zhuangWins = 0
 			result.zhuangLoss = 1
 			result.zhuangDrankCups = 3
 			result.xianWins = 1
 			result.xianLoss = 0
 			result.xianDrankCups = 0
 			result.comment="庄家" +  zhuang + "水鱼喔，可惜闲家" +  xian + "有麻麻，庄家饮3杯"
 			result.commentToZhuang="你水鱼喔，可惜闲家" +  xian + "有麻麻，你饮3杯"
 			result.commentToXian="庄家" +  zhuang + "水鱼喔，但系你有麻麻，" + zhuang + "饮3杯"
 			}else if (xianCardStatus.status==="shuiYu"&&zhuangCardStatus.status==="maMa"){
 			result.zhuangWins = 1
 			result.zhuangLoss = 0
 			result.zhuangDrankCups = 0
 			result.xianWins = 0
 			result.xianLoss = 1
 			result.xianDrankCups = 3	
 			result.comment="闲家" +  xian + "水鱼喔，可惜庄家" + zhuang +" 有麻麻，闲家饮3杯"
 			result.commentToZhuang="闲家" +  xian + "水鱼喔，可惜你有麻麻，" + xian + "饮3杯"
 			result.commentToXian="你水鱼喔，可惜庄家"+ zhuang + "有麻麻，你饮3杯"
 	     	} else if (zhuangCardStatus.status==="bao"&&xianCardStatus.status!=="bao"){
 	     	result.zhuangWins = 1
 			result.zhuangLoss = 0
 			result.zhuangDrankCups = 0
 			result.xianWins = 0
 			result.xianLoss = 1
 			result.xianDrankCups = 2
 			result.comment="庄家" +  zhuang + "有宝，闲家" +  xian + "母有，闲家饮2杯"
 			result.commentToZhuang="你有宝，闲家" +  xian + "母有宝，" + xian + "饮2杯"
 			result.commentToXian="庄家" + zhuang + "有宝，你母有，你饮2杯"
 	     	} else if (zhuangCardStatus.status==="bao"&&xianCardStatus.status==="bao"&&zhuangCardStatus.big>xianCardStatus.big) {
 	     	result.zhuangWins = 1
 			result.zhuangLoss = 0
 			result.zhuangDrankCups = 0
 			result.xianWins = 0
 			result.xianLoss = 1
 			result.xianDrankCups = 2
 			result.comment="庄家" + zhuang + "有宝，闲家" + xian + "亦有宝，庄家宝大于闲家宝，闲家饮2杯"
 			result.commentToZhuang="你有宝，闲家" + xian + "亦有宝，你只宝大，" +  xian + "饮2杯"
 			result.commentToXian="庄家" +  zhuang + " 有宝，你亦有宝，但系你只宝细，你饮2杯"
 	     	} else if ((zhuangCardStatus.status==="bao"&&xianCardStatus.status==="bao"&&zhuangCardStatus.big<xianCardStatus.big&&zhuangCardStatus.small>xianCardStatus.small) || (zhuangCardStatus.status==="bao"&&xianCardStatus.status==="bao"&&zhuangCardStatus.big<xianCardStatus.big&&zhuangCardStatus.small===xianCardStatus.small&&zhuangCardStatus.baoSmallBig>xianCardStatus.baoSmallBig)){
 	     	result.zhuangWins = 1
 			result.zhuangLoss = 0
 			result.zhuangDrankCups = 0
 			result.xianWins = 0
 			result.xianLoss = 1
 			result.xianDrankCups = 2
 			result.comment="庄家" + zhuang + "宝细过闲家" + xian + "宝，但庄家小对大于闲家小对，闲家饮2杯"
 			result.commentToZhuang="你宝细过闲家" + xian + "宝，但你小对大，" +  xian + "饮2杯"
 			result.commentToXian="庄家" +  zhuang + " 宝细过你只宝，但系你只小对细，你饮2杯"
 	     	}  else if ((zhuangCardStatus.status!=="bao"&&xianCardStatus.status==="bao"&&zhuangCardStatus.small>xianCardStatus.small) || (zhuangCardStatus.status!=="bao"&&xianCardStatus.status==="bao"&&zhuangCardStatus.small===xianCardStatus.small&&zhuangCardStatus.noneSmallBig>xianCardStatus.baoSmallBig)){
 	     	  result.zhuangWins = 1
 		 	  result.zhuangLoss = 0
 			  result.zhuangDrankCups = 0
 			  result.xianWins = 0
 			  result.xianLoss = 1
 			  result.xianDrankCups = 2
 	     	 result. comment="庄家" + zhuang + "母有宝，闲家" +  xian + "有宝，但系闲家小对细过庄家小对，闲家饮2杯"
 	     	 result.commentToZhuang="你母有宝，闲家" +  xian + "有宝，但系闲家小对细过你小对，" + xian + "饮2杯"
 			 result.commentToXian="庄家" +  zhuang + "母有宝，你有宝，但系你小对细过" + zhuang + "小对，你饮2杯"
 	     	 }else if((zhuangCardStatus.status!=="bao"&&xianCardStatus.status!=="bao"&&zhuangCardStatus.big>xianCardStatus.big)||(zhuangCardStatus.status!=="bao"&&xianCardStatus.status!=="bao"&&zhuangCardStatus.big===xianCardStatus.big&&zhuangCardStatus.noneBigBig>xianCardStatus.noneBigBig )){
 	     	  result.zhuangWins = 1
 		 	  result.zhuangLoss = 0
 			  result.zhuangDrankCups = 0
 			  result.xianWins = 0
 			  result.xianLoss = 1
 			  result.xianDrankCups = 2
 	     	 result. comment="庄家" + zhuang + "闲家" + xian + "都母有宝，但系闲家两对母能双杀庄家两对，闲家饮2杯"
 	     	 result.commentToZhuang="你同闲家" + xian + "都母有宝，但系" + xian + "两对母能双杀你两对，" + xian + "饮2杯"
 			 result.commentToXian="庄家" +  zhuang + "同你都母有宝，但系你两对母能双杀" + zhuang + "两对，你饮2杯"
 	     	 }else if((zhuangCardStatus.status!=="bao"&&xianCardStatus.status!=="bao"&&zhuangCardStatus.small>xianCardStatus.small)||(zhuangCardStatus.status!=="bao"&&xianCardStatus.status!=="bao"&&zhuangCardStatus.small===xianCardStatus.small&&zhuangCardStatus.noneSmallBig>xianCardStatus.noneSmallBig)){
 	     	  result.zhuangWins = 1
 		 	  result.zhuangLoss = 0
 			  result.zhuangDrankCups = 0
 			  result.xianWins = 0
 			  result.xianLoss = 1
 			  result.xianDrankCups = 2
 	     	 result. comment="庄家" + zhuang + "闲家" + xian + "都母有宝，但系闲家两对母能双杀庄家两对，闲家饮2杯"
 	     	 result.commentToZhuang="你同闲家" + xian + "都母有宝，但系" + xian + "两对母能双杀你两对，" + xian + "饮2杯"
 			 result.commentToXian="庄家" +  zhuang + "同你都母有宝，但系你两对母能双杀" + zhuang + "两对，你饮2杯"
 	     	 } else {
 	     	   result.zhuangWins = 0
 		 	   result.zhuangLoss = 1
 			   result.zhuangDrankCups = 2
 			   result.xianWins = 1
 			   result.xianLoss = 0
 			   result.xianDrankCups = 0
 	     	   result. comment="闲家" + xian + "两对双杀庄家" + zhuang + "两对，庄家饮2杯"
 	     	   result.commentToZhuang="闲家" + xian + "两对双杀你两对，你饮2杯"
 			  result.commentToXian="你两对双杀庄家" + zhuang + "两对，" + zhuang + "饮2杯"
 	     	  
 	     	 }
 		
 		return result;
 		
 	},

	                   	                             
}

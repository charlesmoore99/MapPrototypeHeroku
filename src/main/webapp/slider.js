"use strict";
function collision($div1, $div2) {
    var x1 = $div1.offset().left;
    var y1 = $div1.offset().top;
    var h1 = $div1.outerHeight(true);
    var w1 = $div1.outerWidth(true);
    var b1 = y1 + h1;
    var r1 = x1 + w1;
    var x2 = $div2.offset().left;
    var y2 = $div2.offset().top;
    var h2 = $div2.outerHeight(true);
    var w2 = $div2.outerWidth(true);
    var b2 = y2 + h2;
    var r2 = x2 + w2;

    if (b1 < y2 || y1 > b2 || r1 < x2 || x1 > r2) return false;
    return true;
}


function redrawSlider(players, duration, now) {
	var then = now.clone().subtract(duration, "s");
	
	var nowString = now.format("HH:mm");
	var thenString = then.format("HH:mm");
	$("#now").empty().append(nowString);
	$("#then").empty().append(thenString);
	
	var slider = $("#slider");
	slider.empty();
	$.each(players.getPlayers(), function (k,v){	
		var diff = now.diff(moment(v.phenomenonTime), "s", true); 
		var pct = (diff / duration) * 100;
		if (pct > 97) {
			return;
		}
		var colorMode = "Light";
		if (pct >= 25) {
//			colorMode = "Medium";  // medium appears to do nothing
			colorMode = "Dark";
		}
		if (pct >= 50) {
			colorMode = "Dark";
		}
		
		var symbol = new ms.Symbol(v.sidc, {
			size:10,
			square:true, 
			colorMode: colorMode
		});
		var domSymbol = symbol.asDOM();
		console.log(k + " " + v.name + " " + parseInt(diff,10) + " " + pct);
		var symbolWrapper = $("<div class='iconWrapper' playerNumber='"+ v.id +"' style='position: absolute; left: .5em; top: "+ pct+"%'></div>");
		symbolWrapper.append(domSymbol);
		$("#slider").append( symbolWrapper );
		$(symbolWrapper).qtip({
			show : "click",
	           hide: {
	               fixed: true,
	               delay: 300
	           },
	           title : "Reports",
			content: function(e) {
				var rv = "";
				$("div.iconWrapper").each(function(i,v){
					if (e.currentTarget === v) {
						var cur = players.getPlayer($(v).attr('playerNumber'))
						rv += "<li>" + cur.type + ": " + cur.name;
					} else if (collision( $(e.currentTarget), $(v))) {
						var cur = players.getPlayer($(v).attr('playerNumber'))
						rv += "<li>" + cur.type + ": " + cur.name;				
					}
				});
				
				return rv;
			}
		});
		
	});
};




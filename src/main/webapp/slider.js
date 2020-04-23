"use strict";
function collision($div1, $div2) {
    var div1Top = $div1.offset().top;
    var div1Bottom = div1Top + $div1.outerHeight(true);

    var div2Top = $div2.offset().top;
    var div2Bottom = div2Top + $div2.outerHeight(true);

    if (div1Top < div2Top && div1Bottom < div2Top) {
    	return false;
    } else if (div1Top > div2Bottom && div1Top > div2Top) {
        return false;
    } else {
    	return true;
    }
}

function mesagePopup(playerNumber) {
	alertify.alert('Alert Title', 'Alert Message!', function(){ alertify.success('Ok'); });
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
		var symbolWrapper = $("<div class='iconWrapper' playerNumber='"+ v.id +"' style='position: absolute; left: 35%; top: "+ pct+"%'></div>");
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




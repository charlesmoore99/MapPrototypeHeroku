<!DOCTYPE html>
<%
	String ws = "8080";
	String wss = "8080";
%>
<html>
<head>

<title>TimeSlider</title>

<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<link rel="shortcut icon" type="image/x-icon" href="docs/images/favicon.ico" />
<link rel="stylesheet"	href="https://unpkg.com/leaflet@1.6.0/dist/leaflet.css"	integrity="sha512-xwE/Az9zrjBIphAcBb3F6JVqxf46+CDLwfLMHloNu6KEQCAWi6HcDUbeOfBIptF7tcCzusKFjFw2yuvEpDL9wQ=="	crossorigin="" />

<link rel="stylesheet" href="css/alertify.min.css"/>
<link rel="stylesheet" href="qtip.css"/>
<link rel="stylesheet" href="css/themes/default.min.css"/>
<link rel="stylesheet" href="jquery-ui-1.12.1/jquery-ui.css"/>
 
 
<link rel="stylesheet" href="jQRangeSlider-5.8.0/css/iThing.css" type="text/css" />
<link rel="stylesheet" href="jQRangeSlider-5.8.0/css/marker.css" type="text/css" />

<link rel="stylesheet" href="MarkerCluster.css"/>
<link rel="stylesheet" href="MarkerCluster.Default.css"/>
<style>
.ui-rangeSlider-bar {
	background : #68a1d699;
}
</style>
</head>
<body>
	<script type='text/javascript' src='jquery-3.4.1.min.js'></script>
	<script type='text/javascript' src='jquery-ui-1.12.1/jquery-ui.js'></script>
	<script src="https://unpkg.com/leaflet@1.6.0/dist/leaflet.js"
		integrity="sha512-gZwIG9x3wUXg2hdXF6+rVkLF/0Vi9U8D2Ntg4Ga5I5BZpVkVxlJWbSQtXPSiUTtC0TjtGOmxa1AJPuV0CPthew=="
		crossorigin=""></script>
	<!--  https://github.com/Leaflet/Leaflet.markercluster-->
	<script type='text/javascript' src="leaflet.markercluster.js"></script>
	
	<script type='text/javascript' src='alertify.min.js'></script>
	<script type='text/javascript' src='moment.js'></script>
	<script type='text/javascript' src='qtip.js'></script>
	
	<script type='text/javascript' src='WebSocket.js'></script>

	<script type="text/javascript" src="map.js"></script>
	<script type="text/javascript" src="milsymbol.js"></script>
	<script type="text/javascript" src="player.js"></script>


	<div style="display: flex;justify-content: flex-start;">
		<div style="width: 640px;">
			<div id="band" style="position: relative; height: 4em;background:grey;">
				<div id="slider" style="position: absolute; top: 1em; height:2em; width: 100%; background:lightgrey;"></div>
			</div>
		</div>
		<div style="float: right; width:100%">
			<h1>Sensors</h1><hr>
			<div id="sensors"></div>
			<br>
			<h1>Reports</h1><hr>
			<div id="reports"></div>
		</div>
	</div>
	<div id="controls">
		<button type="button" id="startClock">Start Clock</button>
		<button type="button" id="endClock">End Clock</button>&nbsp;&nbsp;&nbsp;&nbsp;
		<select id="duration">
			<option value="300" selected>5 Min</option>
			<option value="600">10 Min</option>
			<option value="1800">30 Min</option>
			<option value="3600">1 Hour</option>
			<option value="14400">4 Hour</option>
			<option value="86400">1 Day</option>
		</select>
	</div>
	
	<script>
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
		var slider = $("#slider");
		slider.empty();
		
		$.each(players.getPlayers(), function (k,v){	
			var diff = now.diff(v.phenomenonTime, "s", true); 
			var pct = (diff / duration) * 100;
			if (pct > 97) {
				return;
			}
			var colorMode = "Light";
			if (pct >= 25) {
				colorMode = "Medium";
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
			var symbolWrapper = $("<div class='iconWrapper' playerNumber='"+ v.id +"' style='position: absolute; top: .5em; right: "+ pct+"%'></div>");
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
							rv += "<li>" + cur.name;
						} else if (collision( $(e.currentTarget), $(v))) {
							var cur = players.getPlayer($(v).attr('playerNumber'))
							rv += "<li>" + cur.name;						
						}
					});
					
					return rv;
				}
			});
			
		});
	};
	  
	
	var markerLines = [];

	var hist = 10;
	var range = hist * 60;
	
	var now = moment();
	var one = now.clone().subtract("1", "m");
	var oneA = now.clone().subtract("65", "s");
	var two = now.clone().subtract("2", "m");
	var three = now.clone().subtract("3", "m");
	var five = now.clone().subtract("5", "m");
	var seven = now.clone().subtract("7", "m");
	var nine = now.clone().subtract("9", "m");
	
	var i = 0;
	var p0 = new Player({
		id: i++,
		timestamp : now,
		phenomenonTime : now,
		resultTime : now,
		sidc : "SUGPU-------",
		name : "SENREP",
		type : TYPE_REPORT,
		lat : 0,
		lng : 0
	});

	var p1 = new Player({
		id: i++,
		timestamp : one,
		phenomenonTime : one,
		resultTime : one,
		sidc : "SUGPU-------",
		name : "EOBSREP",
		type : TYPE_REPORT,
		lat : 0,
		lng : 0
	});
	var p1a = new Player({
		id: i++,
		timestamp : oneA,
		phenomenonTime : oneA,
		resultTime : oneA,
		sidc : "SUGPU-------",
		name : "SENREP",
		type : TYPE_REPORT,
		lat : 0,
		lng : 0
	});

	var p2 = new Player({
		id: i++,
		timestamp : two,
		phenomenonTime : two,
		resultTime : two,
		sidc : "SUGPU-------",
		name : "EOBSREP",
		type : TYPE_REPORT,
		lat : 0,
		lng : 0
	});

	var p3 = new Player({
		id: i++,
		timestamp : three,
		phenomenonTime : three,
		resultTime : two,
		sidc : "SUGPU-------",
		name : "SENREP",
		type : TYPE_REPORT,
		lat : 0,
		lng : 0
	});

	var p5 = new Player({
		id: i++,
		timestamp : five,
		phenomenonTime : five,
		resultTime : five,
		sidc : "SUGPU-------",
		name : "SENREP",
		type : TYPE_REPORT,
		lat : 0,
		lng : 0
	});
	
	var p7 = new Player({
		id: i++,
		timestamp : seven,
		phenomenonTime : seven,
		resultTime : seven,
		sidc : "SUGPU-------",
		name : "SENREP",
		type : TYPE_REPORT,
		lat : 0,
		lng : 0
	});
	
	var p9 = new Player({
		id: i++,
		timestamp : nine,
		phenomenonTime : nine,
		resultTime : nine,
		sidc : "SUGPU-------",
		name : "SENREP",
		type : TYPE_REPORT,
		lat : 0,
		lng : 0
	});
	
	var players = new PlayerList();
	players.addPlayer(p0);
	players.addPlayer(p1);
	players.addPlayer(p1a);
	players.addPlayer(p2);
	players.addPlayer(p3);
	players.addPlayer(p5);
	players.addPlayer(p7);
	players.addPlayer(p9);
	
	var duration = $("#duration").val()
	redrawSlider(players, duration, moment());
	

	var theTimer;
	$('#startClock').click(function (obj){
		const refreshRate =  (1000);
		
		if (typeof theTimer ==='undefined' || theTimer === null) {	
			theTimer = window.setInterval(() => {
				var duration = $("#duration").val()
				redrawSlider(players, duration, moment());
			}, refreshRate);
		}
	});
	
	$('#endClock').click(function (obj){
		if (typeof theTimer ==='undefined' || theTimer === null) {
			return;
		}
		window.clearInterval(theTimer);
		theTimer = null;
	});
	
	$('#duration').change(function (obj){ 
		var duration = $("#duration").val()
		redrawSlider(players, duration, moment());		
	});


	</script>



</body>
</html>

<!DOCTYPE html>
<%
	//String ws = ":8080";
	//String wss = ":8080";
	String ws = "";
	String wss = "";
%>
<html>
<head>

<title>Situational Awareness Client</title>

<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<link rel="shortcut icon" type="image/x-icon" href="docs/images/favicon.ico" />
<link rel="stylesheet"	href="https://unpkg.com/leaflet@1.6.0/dist/leaflet.css"	integrity="sha512-xwE/Az9zrjBIphAcBb3F6JVqxf46+CDLwfLMHloNu6KEQCAWi6HcDUbeOfBIptF7tcCzusKFjFw2yuvEpDL9wQ=="	crossorigin="" />

<link rel="stylesheet" href="css/alertify.min.css"/>
<link rel="stylesheet" href="css/themes/default.min.css"/>
<link rel="stylesheet" href="jquery-ui-1.12.1/jquery-ui.css"/>
<link rel="stylesheet" href="jquery-layout/layout-default-1.4.4.css"/>

<link rel="stylesheet" href="qtip.css"/>
 
 

<link rel="stylesheet" href="MarkerCluster.css"/>
<link rel="stylesheet" href="MarkerCluster.Default.css"/>
<style>
.ui-rangeSlider-bar {
	background : #68a1d699;
}

body {
 	height : 100%;
 	width: 100%;
}


h1 {
 font-family: Arial, Charcoal, sans-serif;
}
</style>
</head>
<body>
	<script type='text/javascript' src='jquery-3.4.1.min.js'></script>
	<script type='text/javascript' src='jquery-ui-1.12.1/jquery-ui.js'></script>
	<script type="text/javascript" src="jquery-layout/jquery.layout-1.4.4.js"></script>
	
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
	<script type="text/javascript" src="slider.js"></script>
	<script type="text/javascript" src="milsymbol.js"></script>
	<script type="text/javascript" src="player.js"></script>

	<DIV class="ui-layout-center">
		<div style="display: flex; flex-flow: row; height:100%">
			<div id="mapid" style="flex: 1 1 auto;"></div>
				<div style="display: flex; flex-flow: column; height:100%; background: lightgrey;">
					<div id="now" style="flex: 0 1 1.5em;">NOW</div>
					<div id="slider" style="flex: 1 1 auto;position:relative; width:3em;"></div>
					<div id ="then" style="flex: 0 1 1.5em;">THEN</div>
				</div>
			</div>
	 	</div> 
	</DIV>
	<DIV class="ui-layout-north">
	Header Goes Here
	</DIV>
	<DIV class="ui-layout-south">
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
	</DIV>
	<DIV class="ui-layout-east">
		<h1>Reports</h1><hr>
		<div id="reports"></div>
	</DIV>
	<DIV class="ui-layout-west">
		<h1>Sensors</h1><hr>
		<div id="sensors"></div>
	</DIV>

	<script>
	var sensorList = new PlayerList();
	var reportList = new PlayerList();
	
	
	var myLayout; // a var is required because this page utilizes: myLayout.allowOverflow() method
	$(document).ready(function () {
		myLayout = $('body').layout({
			// enable showOverflow on west-pane so popups will overlap north pane
			west__showOverflowOnHover: true

		//,	west__fxSettings_open: { easing: "easeOutBounce", duration: 750 }
		});
		
		
		var mapContainer = new map({id : 'mapid'});
		mapContainer.createMap();

		var viewId = 1;
	   	var uri = ""
		if (window.location.protocol == 'http:') {
		    uri = 'ws://' + window.location.hostname + '<%=ws%>/websocket/' + viewId;
		} else {
		    uri = 'wss://' + window.location.hostname + '<%=wss%>/websocket/' + viewId;
		}

	   	var websocket = new Channel(uri, function(s) {
			console.log("Received: " + s.id);

			// add new new player to player list
			if (s.type === TYPE_SENSOR) {
				sensorList.addPlayer(s);
			} else {
				reportList.addPlayer(s);			
			}

			mapContainer.drawSensors(sensorList, false);
			mapContainer.drawReports(reportList, false);	
			
			
			// run through the player list and update their locations
	   		$('#sensors').empty();
			$.each(sensorList.getPlayers(), function(name, value){
			    $('#sensors').append(value.type + ": " + value.name + "<br>");
			});
			
			
	   		$('#reports').empty();
			$.each(reportList.getPlayers(), function(name, value){
			    $('#reports').append(value.type + ": " + value.name + "<br>");
			});

			var duration = $("#duration").val();
			redrawSlider(reportList, duration, moment());				
		});

		
		var theTimer;
		function startClock() {
			const refreshRate =  (1000);
			if (typeof theTimer ==='undefined' || theTimer === null) {	
				theTimer = window.setInterval(() => {
					var duration = $("#duration").val();
					redrawSlider(reportList, duration, moment());				
				}, refreshRate);
			}
		};
		
		function endClock() {
			if (typeof theTimer ==='undefined' || theTimer === null) {
				return;
			}
			window.clearInterval(theTimer);
			theTimer = null;
		};
		
		
		$('#startClock').click(function (obj){
			startClock();
		});
		
		$('#endClock').click(function (obj){
			endClock();
		});
		
		$('#duration').change(function (obj){ 
			var duration = $("#duration").val()
			redrawSlider(players, duration, moment());		
		});

	   	
		websocket.connect(uri);
		startClock();
 	});



	</script>
</body>
</html>

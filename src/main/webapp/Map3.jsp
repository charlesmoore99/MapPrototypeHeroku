<!DOCTYPE html>
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


div.slider {
	display: flex; 
	align-items: center;
	flex-flow: column; 
	height:100%;
}

div.slider.active {
	background: burlywood;
}


div.slider.paused {
	background: red;
}

div.selected {
	background: lightblue;
}


</style>
</head>
<body>
	<script type='text/javascript' src='jquery-3.4.1.min.js'></script>
	<script type='text/javascript' src='jquery-ui-1.12.1/jquery-ui.js'></script>
	<script type="text/javascript" src="jquery-layout/jquery.layout-1.4.4.js"></script>
	
	<script src="https://unpkg.com/leaflet@1.6.0/dist/leaflet.js" integrity="sha512-gZwIG9x3wUXg2hdXF6+rVkLF/0Vi9U8D2Ntg4Ga5I5BZpVkVxlJWbSQtXPSiUTtC0TjtGOmxa1AJPuV0CPthew==" crossorigin=""></script>

	<!--  https://github.com/Leaflet/Leaflet.markercluster-->
	<script type='text/javascript' src="leaflet.markercluster.js"></script>

	<script type='text/javascript' src='alertify.min.js'></script>
	<script type='text/javascript' src='moment.js'></script>
	<script type='text/javascript' src='qtip.js'></script>
	
	<script type='text/javascript' src='WebSocket.js'></script>
	
	<script type='text/javascript' src='dms.js'></script>
	<script type='text/javascript' src='latLonSpherical.js'></script>

	<script type="text/javascript" src="map.js"></script>
	<script type="text/javascript" src="slider.js"></script>
	<script type="text/javascript" src="milsymbol.js"></script>
	<script type="text/javascript" src="player.js"></script>
	<script type="text/javascript" src="sidc.js"></script>

	<DIV class="ui-layout-center">
		<div style="display: flex; flex-flow: row; height:100%">
			<div id="mapid" style="flex: 1 1 auto;"></div>
				<div class="slider active" style="">
					<div>Reports</div>
					<div>
						<select id="duration">
							<option value="300" selected>5 Min</option>
							<option value="600">10 Min</option>
							<option value="1800">30 Min</option>
							<option value="3600">1 Hour</option>
							<option value="14400">4 Hour</option>
							<option value="86400">1 Day</option>
						</select>
					</div>			
 					<div id="now" style="flex: 0 1 1.5em;">NOW</div>
					<div id="slider" style="flex: 1 1 auto;position:relative; width:3em;"></div>
					<div id ="then" style="flex: 0 1 1.5em;">THEN</div>
					<div id="controls" style="float:right;" >
						<button type="button" id="pausePlay">Pause</button>
					</div>
				</div>
			</div>
	 	</div> 
	</DIV>
	<DIV class="ui-layout-north">
	PROTOTYPE
	</DIV>
	<DIV class="ui-layout-south">
	</DIV>
	<DIV class="ui-layout-east">
		<h1>Reports</h1><hr>
		<form id="reports"></form>
	</DIV>
<!-- 	<DIV class="ui-layout-west"> -->
<!-- 		<h1>Sensors</h1><hr> -->
<!-- 		<div id="sensors"></div> -->
<!-- 	</DIV> -->

	<script>
	var sensorList = new PlayerList();
	var reportList = new PlayerList();
	var selectedList = new PlayerList();
	var mapContainer
	
	

	
	
	function popupReport(playerNumber){
		var player = reportList.getPlayer(playerNumber);
		alertify.alert('USMTF Report', "<pre>" + player.text + "</pre>").set('resizable', true).resizeTo('800px','600px'); ;
	};

	function centerOnPlayer(playerNumber){
		var player = reportList.getPlayer(playerNumber);
		mapContainer.centerOn(player.getLatLon());
	};

	function centerOnPlayers(playerNumber){
		var player = reportList.getPlayer(playerNumber);
		mapContainer.centerOn(player.getLatLon());
	};

	function highlightPlayer(playerNumber) {
	};
	
	function selectPlayer(playerNumber){
		// deselect the old player(s)
		selectedList.clear();

		// select the new player(s)
		$.each($('#reports :checkbox'), function() {
	        console.log("name " + this.name + " " + this.checked);
	        if (this.checked) {
	    		var player = reportList.getPlayer(this.name);
				selectedList.addPlayer(player);	        		        	
	        }
		});		
		mapContainer.drawSelected(selectedList);
	};

	
	var myLayout; // a var is required because this page utilizes: myLayout.allowOverflow() method
	$(document).ready(function () {
		myLayout = $('body').layout({
	        east: {
	        	size: 350
	        },
			// enable showOverflow on west-pane so popups will overlap north pane
			west__showOverflowOnHover: true

		//,	west__fxSettings_open: { easing: "easeOutBounce", duration: 750 }
		});
		
		
		mapContainer = new map({id : 'mapid'});
		mapContainer.createMap();
		
		var viewId = 1;
		var viewId = 1;
	   	var uri = buildWebsocketURI(1);

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
			mapContainer.drawSelected(selectedList, false);	
			
			var reportEntry = "<div><span>";
 			reportEntry += "<input type='checkbox' name='"+ s.id +"' onclick='selectPlayer("+ s.id +")'></input>";
			reportEntry += "<a onclick='popupReport("+ s.id +")'>" + s.type + ": " + s.name + "</a>";
			reportEntry += "</span></div>";
		    $('#reports').prepend(reportEntry);

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
		
		
		var playing = true;
		$('#pausePlay').click(function (obj){
			var sl = $('#pausePlay').closest("div.slider");
			if (playing === true) {
				playing = false;
				$('#pausePlay').html('Resume');
				$(sl).addClass('paused');
				endClock();
			} else {
				playing = true;
				$('#pausePlay').html('Pause');
				$(sl).removeClass('paused');
				startClock();
			}
		});
		
		$('#endClock').click(function (obj){
			endClock();
		});
		
		$('#duration').change(function (obj){ 
			var duration = $("#duration").val()
			redrawSlider(players, duration, moment());		
		});

	   	
		websocket.connect();
		startClock();
 	});



	</script>
</body>
</html>

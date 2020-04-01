<!DOCTYPE html>
<%
	String ws = "8080";
	String wss = "8080";
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
	
	<script src="jQRangeSlider-5.8.0/jQRangeSliderMouseTouch.js"></script>
	<script src="jQRangeSlider-5.8.0/jQRangeSliderDraggable.js"></script>
	<script src="jQRangeSlider-5.8.0/jQRangeSliderHandle.js"></script>
	<script src="jQRangeSlider-5.8.0/jQRangeSliderBar.js"></script>
	<script src="jQRangeSlider-5.8.0/jQRangeSliderLabel.js"></script>
	<script src="jQRangeSlider-5.8.0/jQRangeSlider.js"></script>
	<script src="jQRangeSlider-5.8.0/jQDateRangeSliderHandle.js"></script>
	<script src="jQRangeSlider-5.8.0/jQDateRangeSlider.js"></script>
	<script src="jQRangeSlider-5.8.0/jQRuler.js"></script>
	<script src="jQRangeSlider-5.8.0/jQMarkers.js"></script>


	
	<script type='text/javascript' src='alertify.min.js'></script>
	<script type='text/javascript' src='moment.js'></script>
	
	<script type='text/javascript' src='WebSocket.js'></script>

	<script type="text/javascript" src="map.js"></script>
	<script type="text/javascript" src="milsymbol.js"></script>
	<script type="text/javascript" src="player.js"></script>


	<div style="display: flex;justify-content: flex-start;">
		<div>
			<div id="mapid" style="width: 640px; height: 480px;"></div>
			<div id="slider" style="width: 640px;"></div>
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
	</div>
	
	<script>
	
	var markerLines = [];
	
	var mapContainer = new map({id : 'mapid'});
	mapContainer.createMap();
	var mymap = mapContainer.getMap();
	
	
	
	
	var ticIndex = 0; 
	var labIndex = 0;
	 $("#slider").rangeSlider({
		 bounds: {
			 min: -10, 
			 max: 0
		}, 
		defaultValues: {
		 min: -5, 
		 max: 0
		},
		formatter:function(val){
	        var value = Math.round(val);
	        if (val === 0) {
	        	return "Now";
	        }
	        return value.toString() + " min";
	      },
	    range: {
	    	min: 1
	    },
		markers: markerLines,
		scales: [{
			first : function(val){ 
				return val; 
			},
			next: function(val) { 
				return val + 1;
			},
			stop: function(val){ 
				return false; 
			},
			label: function(val){ 
				return val; 
			},
			stop : function(val) {
				return false;
			}
		}]
	});
	
	var sensorGroup = L.markerClusterGroup().addTo(mymap);
	var reportGroup = L.markerClusterGroup().addTo(mymap);
	
	var viewId = 1;
   	var uri = ""
	if (window.location.protocol == 'http:') {
	    uri = 'ws://' + window.location.hostname + ':<%=ws%>/MapTest/websocket/' + viewId;
	} else {
	    uri = 'wss://' + window.location.hostname + ':<%=wss%>/MapTest/websocket/' + viewId;
	}

   	
	var sensorList = new PlayerList();
	var reportList = new PlayerList();
   	var websocket = new Channel(function(s) {
		console.log("Received: " + s.id);

		// add new new player to player list
		if (s.type === TYPE_SENSOR) {
			sensorList.addPlayer(s);
		} else {
			reportList.addPlayer(s);			
		}
		// TODO
		// update the icons on the map.
		// maybe apply time filter here to retire players that are too old.

		// run through the player list and update their locations
   		sensorGroup.clearLayers();
   		$('#sensors').empty();
		$.each(sensorList.getPlayers(), function(name, value){
			
			// TODO this would be the place to filter visible icoins by datetime 
			// if value.dtg <> daterange 
			//     skip this one
		    var activityMarker = buildMarker(value, false)
	        activityMarker.addTo(sensorGroup);
			
		    $('#sensors').append(name + " " + value.name + "<br>");
			
		});
   		reportGroup.clearLayers();
   		$('#reports').empty();
		markerLines = [];
		
		markerLines.push({
			title : "SENREP",
			link : "SENREP",
			events : []
		});
		markerLines.push({
			title : "EOBSREP",
			link : "EOBSREP",
			events : []
		});
		$.each(reportList.getPlayers(), function(name, value){
			
			// TODO this would be the place to filter visible icoins by datetime 
			// if value.dtg <> daterange 
			//     skip this one
		    var activityMarker = buildMarker(value, false)
	        activityMarker.addTo(reportGroup);				

			var event = {
					id : "marker-" + addevent,
					title : "marker-" + addevent,
					datetime : value.phenomenonTime,
					iconClass : "sensor" 
				}
			addevent+=1;

			markerLines[value.type].events.push(event);			
			redrawMarkers();

			$('#reports').append(name + " " + value.name + "<br>");

		});
	});

	var redrawMarkers = function(){
	    var mx = moment().utc();
	    var mn = moment(mx).subtract(5, 'minute');

	    var ticIndex = 0;
		var labIndex = 0;
	    
		$("#slider").rangeSlider(
	    		  "option", "markers",
	    		  markerLines
		);
	    
		$('#markers').empty();
		
		// cull the expired events
		$.each(markerLines, function(i, line){
			line.events = $.grep(line.events, function(v,i){
				return v.datetime > bounds.min;
			});
		});

		$.each(markerLines, function(i, line){
			$.each(line.events, function(i, v){
				var i = 'marker-' + v.id;
				var max = $("#slider").rangeSlider("max"); 
				var min = $("#slider").rangeSlider("min");
				var selected = "";
				if ((v.datetime >= min) && (v.datetime <= max)) {
					selected = "selected";
				} else {					
					selected = "";
				}
		
				var d = v.datetime.utc().format();
				var ns = `<div id='${i}' class='marker ${selected}'><span class='markerId'>${i}</span>:::<span class='markerDate'>${d}</span></div>`;
				var n = $(ns);
				
				$('#markers').append(n)
			});
		});
		
		$("#slider").rangeSlider("values", moment(mx).subtract(selectWidth, 'seconds'), mx);
	}

   	
   	
	websocket.connect(uri);
	
	
	
	var theTimer;
	$('#startClock').click(function (obj){
		const refreshRate =  (1000);
		
		if (typeof theTimer ==='undefined' || theTimer === null) {	
			theTimer = window.setInterval(() => {
				redrawMarkers();
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
	


	</script>



</body>
</html>

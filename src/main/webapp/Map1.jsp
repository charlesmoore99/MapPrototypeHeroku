<!DOCTYPE html>
<%
	String ws = "8080";
	String wss = "8080";
%>
<html>
<head>

<title>SA Adder</title>

<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<link rel="shortcut icon" type="image/x-icon" href="docs/images/favicon.ico" />
<link rel="stylesheet"	href="https://unpkg.com/leaflet@1.6.0/dist/leaflet.css"	integrity="sha512-xwE/Az9zrjBIphAcBb3F6JVqxf46+CDLwfLMHloNu6KEQCAWi6HcDUbeOfBIptF7tcCzusKFjFw2yuvEpDL9wQ=="	crossorigin="" />

<link rel="stylesheet" href="css/alertify.min.css"/>
<link rel="stylesheet" href="css/themes/default.min.css"/>

</head>
<body>
	<script src="https://unpkg.com/leaflet@1.6.0/dist/leaflet.js"
		integrity="sha512-gZwIG9x3wUXg2hdXF6+rVkLF/0Vi9U8D2Ntg4Ga5I5BZpVkVxlJWbSQtXPSiUTtC0TjtGOmxa1AJPuV0CPthew=="
		crossorigin=""></script>
	<script type='text/javascript' src="leaflet.markercluster.js"></script>
			
	<script type='text/javascript' src='jquery-3.4.1.min.js'></script>
	<script type='text/javascript' src='alertify.min.js'></script>
	<script type='text/javascript' src='moment.js'></script>

	<script type='text/javascript' src='WebSocket.js'></script>
	<script type='text/javascript' src='map.js'></script>
	<script type="text/javascript" src="milsymbol.js"></script>
	<script type='text/javascript' src='player.js'></script>

	<script type='text/javascript' src='dms.js'></script>
	<script type='text/javascript' src='latLonSpherical.js'></script>

	<div id="mapid" style="width: 600px; height: 400px;"></div>	
	
	<p>Select Icon Type:</p>
	<fieldset>
	 	<input type="radio" id="sensor" name="icon" value="SENSOR" checked>
	 	<label for="sensor">Sensor</label><br>	
	</fieldset>
	<fieldset>
	 	<input type="radio" id="report" name="icon" value="REPORT">
	 	<label for="unknown">Report</label><br>
	 	<div style="margin-left: 40px;">
	 	<input type="radio" id="senrep" name="reportType" value="SENREP" checked disabled><label for="sensor">SENREP</label><input type="radio" id="eobsrep" name="reportType" value="EOBSREP" disabled><label for="unknown">EOBSREP</label><br>
		<input type="text" id="speed" name="speed" value="" width="2" disabled><label for="speed">Speed (kph)</label><br>		
		<input type="text" id="bearing" name="bearing" value="" width="3" disabled><label for="bearing">Bearing(degrees magnetic)</label>
	  	</div>
	</fieldset>


  	<br>	

	<script>
	$("#sensor").click(function(){
		$("#senrep").prop("disabled", true);
		$("#eobsrep").prop("disabled", true);
		$("#speed").prop("disabled", true);
		$("#bearing").prop("disabled", true);
		
		$("#senrep").prop("checked", true);
		$("#speed").val("");
		$("#bearing").val("");
	});
	
	$("#report").click(function(){
		$("#senrep").prop("disabled", false);
		$("#eobsrep").prop("disabled", false);
		$("#speed").prop("disabled", false);
		$("#bearing").prop("disabled", false);
	});
	
	var mapContainer = new map({id : 'mapid'});''
	mapContainer.createMap();
	var mymap = mapContainer.getMap();

	var viewId = 1;
   	var uri = ""
       if (window.location.protocol == 'http:') {
           uri = 'ws://' + window.location.hostname + ':<%=ws%>/MapTest/websocket/' + viewId;
       } else {
           uri = 'wss://' + window.location.hostname + ':<%=wss%>/MapTest/websocket/' + viewId;
	}
	var websocket = new Channel(function(s) {
		console.log("Transmitted: " + s.id);
	});
	websocket.connect(uri);

	var players =  new PlayerList();

	var roll = 1;
	function onMapClick(e) {
		var icon = $('input[name="icon"]:checked').val();  // sensor, report
		var reportType = $('input[name="reportType"]:checked').val();  // sensor, unk, predicted
		if (icon === "SENSOR") {
			reportType = icon;
		}
		var s = $('input[name="speed"]').val(); 
		var b = $('input[name="bearing"]').val();
		
		var ll = e.latlng;
		var dtg = moment().utc();
		var p = new Player({
			id : "" + roll++,
			timestamp : parseInt(dtg.format('x'),10),
			phenomenonTime : parseInt(dtg.format('x'),10), 
			resultTime : parseInt(dtg.format('x'),10), 
			sidc : calculateSidc(icon, STATUS_PRESENT),
			name : "NAME",
			type : reportType,
			lat : ll.lat,
			lng : ll.lng,
			speed : s,
			bearing : b
		});
		players.addPlayer(p);
		websocket.sendMessage(JSON.stringify(p));

	    var activityMarker = buildMarker(p, true)
        activityMarker.addTo(mymap);
		activityMarker.on('dragend', function (e) {
			var ll = e.target.getLatLng();
			var p = players.getPlayer(e.target.options.id);
			p.lat = ll.lat;
			p.lng = ll.lng;
			players.addPlayer(p);
			websocket.sendMessage(JSON.stringify(p));
			createAnticipatedPlayer(mapContainer, p);
		});
		createAnticipatedPlayer(mapContainer, p);

// 		if (s && b) {
// 			var ll2 = mymap.calculateEstimatedLocation(ll, s, b);
// 			var newDTG = dtg.clone().add(5, 'm');
// 			var a = new Player({
// 				id : "" + roll++,
// 				timestamp : parseInt(newDTG.format('x')),
// 				phenomenonTime : parseInt(newDTG.format('x')), 
// 				resultTime : parseInt(newDTG.format('x')), 
// 				sidc : calculateSidc(icon, STATUS_ANTICIPATED),
// 				name : "NAME",
// 				type : reportType,
// 				lat : ll2.lat,
// 				lng : ll2.lng,
// 				speed : s,
// 				bearing : b
// 			});
// 			players.addPlayer(a);
// 			websocket.sendMessage(JSON.stringify(a));

// 			var anticipatedActivityMarker = buildMarker(a, true);
// 			anticipatedActivityMarker.addTo(mymap);
// 	        anticipatedActivityMarker.on('dragend', function (e) {
// 				var ll = e.target.getLatLng();
// 				var p = players.getPlayer(e.target.options.id);
// 				p.lat = ll.lat;
// 				p.lng = ll.lng;
// 				players.addPlayer(p);
// 				websocket.sendMessage(JSON.stringify(p));
// 			});
			
// 		}
	}

	mymap.on('click', onMapClick);
	</script>
</body>
</html>

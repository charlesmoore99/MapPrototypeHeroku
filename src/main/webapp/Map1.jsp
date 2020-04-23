<!DOCTYPE html>
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
	<script type='text/javascript' src='sidc.js'></script>

	<script type='text/javascript' src='dms.js'></script>
	<script type='text/javascript' src='latLonSpherical.js'></script>

	<div id="mapid" style="width: 600px; height: 400px;"></div>	
	
	<input id="auto" type='checkbox'> auto </input> 
	
	<p>Select Icon Type:</p>
	<fieldset>
	 	<input type="radio" id="sensor" name="icon" value="SENSOR" >
	 	<label for="sensor">Sensor</label><br>	
	</fieldset>
	<fieldset>
	 	<input type="radio" id="report" name="icon" value="REPORT" checked>
	 	<label for="unknown">Report</label><br>
	 	<div style="margin-left: 40px;">
	 	<input type="radio" id="senrep" name="reportType" value="SENREP" checked ><label for="sensor">SENREP</label><input type="radio" id="eobsrep" name="reportType" value="EOBSREP" disabled><label for="unknown">EOBSREP</label><br>
		<input type="text" id="speed" name="speed" value="" width="2" ><label for="speed">Speed (kph)</label><br>		
		<input type="text" id="bearing" name="bearing" value="" width="3" ><label for="bearing">Bearing(degrees magnetic)</label>
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
   	var uri = buildWebsocketURI(1);

	var websocket = new Channel(uri, function(s) {
		console.log("Transmitted: " + s.id);
	});
	websocket.connect();

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
		var sidcFactory = new sidc();
		var p = new Player({
			id : "" + roll++,
			timestamp : parseInt(dtg.format('x'),10),
			phenomenonTime : parseInt(dtg.format('x'),10), 
			resultTime : parseInt(dtg.format('x'),10), 
			sidc : sidcFactory.calculateSidc(),
			name : "NAME " + (roll-1),
			type : reportType,
			lat : ll.lat,
			lng : ll.lng,
			speed : s,
			bearing : b,
			text : "MSGID/EOBSREP/MIL-STD-6040(SERIES)/B.1.01.14/M/-/20200421T184722Z/INI/-/USA/UNCLASSIFIED/-//\n" +
				"REF/A/TYPE:MSG/IMAGE/TRAILCAM/20200421T163929Z/-/PASEP//\n" +
				"REF/B/TYPE:MSG/TRIP-LINE/TRAILCOUNTER/20200421T163931Z/-/PASEP//\n" +
				"ENACTLOC/OBSER/UTM:18SUD1440341523/SE/4KPH/WGS84/UTM:18SUD1460641235/-//\n" +
				"ENEUNIT/NEUTRAL/-/-/-/-/-/-/-/-/-//\n" +
				"OBTIME/211652ZAPR2020/-/-/211657ZAPR2020//\n"
		});
		players.addPlayer(p);
		websocket.sendMessage(JSON.stringify(p));

	    var activityMarker = buildMarker(p, 15, true)
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
	}

	mymap.on('click', onMapClick);
	
	
	
	var theTimer;

	function startClock() {
		const refreshRate =  (1000 * 10);
		if (typeof theTimer ==='undefined' || theTimer === null) {	
			theTimer = window.setInterval(() => {
				if ($("#auto").prop("checked") == true) {
					onMapClick({
						latlng : L.latLng(mapContainer.getMap().getCenter())
					});
				}			
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
	
	
   	
	startClock();
	
	
	</script>
</body>
</html>

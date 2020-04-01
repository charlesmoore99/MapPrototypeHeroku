"use strict";

var map = function(o) {
	
	var self = this;
	self.mapId = o.id;
	self.mymap = null;
	self.sensorGroup = null;
	self.reportGroup = null;
	self.selectedGroup = null;
	self.anticipatedGroup = null;

	self.createMap = function(){
		self.mymap = L.map(self.mapId).setView([51.505, -0.09], 13);
		
		L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
			maxZoom: 18,
			attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
				'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
				'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
			id: 'mapbox/streets-v11',
			tileSize: 512,
			zoomOffset: -1
		}).addTo(self.mymap);
		
		self.sensorGroup = L.markerClusterGroup().addTo(self.mymap);
		self.reportGroup = L.markerClusterGroup().addTo(self.mymap);
		self.selectedGroup = L.markerClusterGroup().addTo(self.mymap);
		self.anticipatedGroup = L.markerClusterGroup().addTo(self.mymap);

	};
	
	self.getMap = function(){
		return self.mymap;
	};
	
	self.drawSensors = function(sensors, dragable) {
		// TODO this would be the place to filter visible icoins by datetime 
		// if value.dtg <> daterange 
		//     skip this one
		self.sensorGroup.clearLayers();
		$.each(sensors.getPlayers(), function(name, value){
		    var activityMarker = buildMarker(value, dragable)
	        activityMarker.addTo(self.sensorGroup);
		});
	};

	self.drawReport = function (player, dragable) {
	    var activityMarker = buildMarker(player, dragable);
        activityMarker.addTo(self.reportGroup);
        return activityMarker;
	}
	
	self.drawReports = function(reports, dragable) {
		// TODO this would be the place to filter visible icoins by datetime 
		// if value.dtg <> daterange 
		//     skip this one

		self.reportGroup.clearLayers();
		$.each(reports.getPlayers(), function(name, value){
			self.drawReport(value, dragable);
		});
	};
	
	self.drawSelected = function(reports) {
		self.selectedGroup.clearLayers();
		$.each(selected.getPlayers(), function(name, value){
		    var activityMarker = buildMarker(value, false)
	        activityMarker.addTo(self.selectedGroup);
		});
	};

	self.createAnticipatedPlayerMarker = function(player, dragable) {
		self.anticipatedGroup.clearLayers();
	    var ap = buildAnticipatedPlayer(player, dragable);
	    var activityMarker = buildMarker(ap, true)
        activityMarker.addTo(self.anticipatedGroup);
        return activityMarker;
	};

};


var calculateEstimatedLocation = function(player) {
	// convert mgrs to lat/lon/alt
	var lon = player.lng;
	var lat = player.lat;
	var ll0 = new LatLonSpherical(lat, lon);
	console.log("player "+ player.id +" [" + player.lat + ", " + player.lng + "]");
	
	// convert date string to date
	var start = moment().utc();
	var end = start.clone().add(5, 'm');
	var elapsedSeconds = Math.abs(end.diff(start,'seconds'));
	
	// convert speed to mps
	var rate = player.speed * 0.277778;

	var distance = elapsedSeconds * rate;
	var ll1 = ll0.destinationPoint(distance, player.bearing );
	return {lat :ll1._lat, lng :  ll1._lon}
};

var createAnticipatedPlayer = function(map, player) {
	if (typeof player.speed === 'undefined' || typeof player.bearing === 'undefined'
		||player.speed === '' || player.bearing === '') {
		return;
	}
	var anticipatedPlayer 			
	var a = buildAnticipatedPlayer(player, true);
	var anticipatedActivityMarker = map.createAnticipatedPlayerMarker(a, false);
}; 
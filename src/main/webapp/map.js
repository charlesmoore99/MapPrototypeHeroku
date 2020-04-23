"use strict";



var SMALL_ICON = 15;
var MEDIUM_ICON = 20;
var LARGE_ICON = 45;

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
		
		self.sensorGroup = L.markerClusterGroup().setZIndex(10).addTo(self.mymap);
		self.reportGroup = L.markerClusterGroup().setZIndex(20).addTo(self.mymap);
		self.anticipatedGroup = L.featureGroup().setZIndex(30).addTo(self.mymap);
		self.selectedGroup = L.featureGroup().setZIndex(40).addTo(self.mymap);

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
		    var activityMarker = buildMarker(value, SMALL_ICON, dragable)
	        activityMarker.addTo(self.sensorGroup);
		});
	};

	self.drawReport = function (player, dragable) {
	    var activityMarker = buildMarker(player, MEDIUM_ICON, dragable);
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
	
	self.drawSelected = function(selected) {
		self.selectedGroup.clearLayers();
		self.anticipatedGroup.clearLayers();
		var numSelected = 0;
		$.each(selected.getPlayers(), function(name, value){
		    var activityMarker = buildMarker(value, LARGE_ICON,  false)
	        activityMarker.addTo(self.selectedGroup);
		    if (value.hasPredictedLocation()) {
			    var ap = buildAnticipatedPlayer(value, false);
			    var anticipatedActivityMarker = buildMarker(ap, LARGE_ICON,  false)
		        anticipatedActivityMarker.addTo(self.anticipatedGroup);
		    }
		    numSelected += 1;
		});
		var bounds = self.selectedGroup.getBounds();
		if (numSelected > 0) {
			self.mymap.flyToBounds(bounds, {padding: [10,10], maxZoom : 14});
		}
	};

	self.createAnticipatedPlayerMarker = function(player, size, dragable) {
		self.anticipatedGroup.clearLayers();
	    var ap = buildAnticipatedPlayer(player, dragable);
	    var activityMarker = buildMarker(ap, size, true)
        activityMarker.addTo(self.anticipatedGroup);
        return activityMarker;
	};

	self.centerOn = function (latlng) {
		self.mymap.setView(latlng);
	};
};


var createAnticipatedPlayer = function(map, player, size) {
	if (typeof player.speed === 'undefined' || typeof player.bearing === 'undefined'
		||player.speed === '' || player.bearing === '') {
		return;
	}
	var a = buildAnticipatedPlayer(player, size, false);
	var anticipatedActivityMarker = map.createAnticipatedPlayerMarker(a, size, false);
}; 
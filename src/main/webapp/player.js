var STATUS_PRESENT = "P";
var STATUS_ANTICIPATED = "A";

var AFFILIATION_UNKNOWN = "P";
var AFFILIATION_ENEMY = "H";
var AFFILIATION_NEUTRAL = "N";

var TYPE_SENSOR = "SENSOR";
var TYPE_OBSERVATION = "OBSERVATION";
var TYPE_REPORT = "REPORT";

var Player = function(o) {
	var self = this;

	self.id = o.id;
	self.parentId = o.parentId;
	self.timestamp = o.timestamp;
	self.phenomenonTime = o.phenomenonTime;
	self.resultTime = o.resultTime;
	self.sidc = o.sidc;
	self.name = o.name;
	self.type = o.type;
	self.lat = o.lat;
	self.lng = o.lng;
	self.speed = o.speed;
	self.bearing = o.bearing;
};


var PlayerList = function(){
	var self = this;
	
	self.players = {};
	
	self.addPlayer = function(player){
		self.players[player.id] = player;
	};
	
	self.getPlayer = function(id){
		return self.players[id];
	};
	
	self.playerExists = function(id) {
		return typeof self.players[id] !== "undefined"; 
	}
	
	self.getPlayers = function(){
		return self.players;
	}
};


var isSensor = function(player) {
	
};
var calculateSidc = function(type, status) {
	var sidc = ""
	if (type === TYPE_SENSOR)
		sidc = "SFGPES------";
	if (type === TYPE_REPORT)
		sidc = "SUGPU-------";
	sidc = setStatus(sidc, status);
	return sidc;
};

function setStatus(sidc, status) {
	switch (status) {
	case STATUS_PRESENT:
	case STATUS_ANTICIPATED:
		return sidc.substr(0, 3) + status + sidc.substr(4);
	default:
		return;
	}
}

function setAffiliation(sidc, affiliation) {
	switch (affiliation) {
	case AFFILIATION_UNKNOWN:
	case AFFILIATION_ENEMY:
	case AFFILIATION_NEUTRAL:
		return sidc.substr(0, 1) + affiliation + sidc.substr(2);
	default:
		return;
	}
}

function buildSymbol(player, size){
	var activitySymbol = new ms.Symbol(player.sidc);
	activitySymbol = activitySymbol.setOptions({
		size: size,
		staffComments: player.name,
		dtg : moment(player.phenomenonTime).utc().format('DDHHmm[Z]MMMYYYY').toUpperCase(),
		type: player.type,
		direction: player.bearing,
		speed: (player.speed ? player.speed + "KPH" :"")
	});
	return activitySymbol;
};
 
function buildIcon(player) {
	var activitySymbol = buildSymbol(player, 30);
	var activityIcon = L.divIcon({
		className: '',
		html: activitySymbol.asSVG(),
		iconAnchor: new L.Point(activitySymbol.getAnchor().x, activitySymbol.getAnchor().y)
	});
	return activityIcon;
}


function buildMarker(player, draggable) {
	var activityIcon = buildIcon(player); 
    var activityMarker = L.marker(player, {
    	draggable: draggable,
		icon: activityIcon,
		id: player.id
    });
	return activityMarker;
}

function buildAnticipatedPlayer(player, dragable) {
	var ll2 = calculateEstimatedLocation(player);
	var newDTG = moment(player.phenomenonTime).add(5, 'm');
	return new Player({
		id : "" + roll++,
		parentId : player.id,
		timestamp : parseInt(newDTG.format('x')),
		phenomenonTime : parseInt(newDTG.format('x')), 
		resultTime : player.resultTime, 
		sidc : setStatus(player.sidc, STATUS_ANTICIPATED),
		name : player.name,
		type : player.typee,
		lat : ll2.lat,
		lng : ll2.lng,
		speed : player.speed,
		bearing : player.bearing
	});
};


function calculateEstimatedDistanceAndBearing(player, anticipatedPlayer) {
	
	var elapsedSeconds = 300;
	
	// convert mgrs to lat/lon/alt
	var ll0 = [player.lat, player.lng];
	var ll1 = [anticipatedPlayer.lat, anticipatedPlayer.lng]
	var latLon0 = new LatLonSpherical(ll0[1], ll0[0]);
	var latLon1 = new LatLonSpherical(ll1[1], ll1[0]);
	
	var distance = latLon0.distanceTo(latLon1); // in meters
	var bearing = latLon0.initialBearingTo(latLon1);  

	// calculate the time difference
	var mps = distance / elapsedSeconds
	var kph = mps * 3.6;

	return {
		speed : kph,
		bearing : bearing
	};	
};
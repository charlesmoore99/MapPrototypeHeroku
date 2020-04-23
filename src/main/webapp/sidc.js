

var sidc = function () {
	
	var self= this;
	
	self.defaults = {
		exercise : "", // form set-able based on EXER Line
		scheme : "S",  // (1) - constant
		affiliation : "U", // (2) - form set-able based on ENEUNIT UNIT-DESIGNATOR 
		dimension : "G", // (3) - constant G = "Ground Unit"
		status : "P", // (4) - Present = "P", Anticipated = "A"
		functionId : "U-----", // (5-10)  Function ID
		unused : "--", // 
		country : "--", // 2 digit country code oer PFIPS Pub Series 10
		oob : "G" // order of battle (ground)
	};
	
	self.defaultVals = function() {
		return Object.assign({}, self.defaults);
	}	

	
	self.buildSidcString = function (options){
		var val =  Object.assign(self.defaultVals(), options);
	
		return "" + val.scheme + val.affiliation + val.dimension + val.status + val.functionId + val.country + val.oob;
	};
	
	
	self.calculateSidc = function (overrides){	
		var sidcOptions = Object.assign(self.defaultVals(), overrides);
		
		// pull some info from the form
		var isExercise = ($("input[name='exer_1']" ).length > 0);
		var unitDesignator = ($("input[name='eneUnit_1_1']" ).length > 0 ? $("input[name='eneUnit_1_1']" ).val() : "");
		
		// if this is
		if (isExercise) {
			switch (unitDesignator) {
			case "HOSTILE" :
				sidcOptions.affiliation ="K";
				break;
			case "NEUTRAL":
				sidcOptions.affiliation ="L";
				break;
			case "UNKNOWN":
				sidcOptions.affiliation ="W";
				break;
			case "":
				sidcOptions.affiliation ="O";
				break;
			default:
				sidcOptions.affiliation ="H";								
			};
		} else {
			switch (unitDesignator) {
			case "HOSTILE" :
				sidcOptions.affiliation ="H";
				break;
			case "NEUTRAL":
				sidcOptions.affiliation ="N";
				break;
			case "UNKNOWN":
				sidcOptions.affiliation ="U";
				break;
			case "":
				sidcOptions.affiliation ="O";
				break;
			default:	
				sidcOptions.affiliation ="H";				
			};
			
		}
		return self.buildSidcString(sidcOptions);
	};
	
	self.calculatePredictedSidc = function (overrides){
		var sidcOptions = Object.assign(self.defaultVals(), overrides,{status : "A"});
		return  self.calculateSidc(sidcOptions);
	};
};
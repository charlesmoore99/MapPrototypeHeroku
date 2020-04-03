	
function buildWebsocketURI (channelNumber){
	var protocol = window.location.protocol;
	if (protocol === "https:") {
		protocol = "wss://";
	} else {
		protocol = "ws://";			
	}
	var host = window.location.host;
	var path = window.location.pathname;
	if (path.includes("/")) {
		path = path.substr(0, path.lastIndexOf("/"));
	}
    return protocol + host + path + '/websocket/' + channelNumber;
}


var Channel = function(uri, callback){
	var self = this;
	
	self.uri = uri;
	self.socket = null;
	
    self.connect = function() {
        if ('WebSocket' in window) {
            self.socket = new WebSocket(self.uri);
        } else if ('MozWebSocket' in window) {
            self.socket = new MozWebSocket(self.uri);
        } else {
        	alertify.notify('WebSocket connection opened.','', 3);
            return;
        }

        self.socket.onopen = function () {
        	alertify.notify('WebSocket connection opened.','', 1);
        };

        self.socket.onclose = function () {
        	alertify.notify('WebSocket connection closed.','', 1);
    		// Keeps the connection alive
   			setTimeout(self.connect, 1000);
        };

        self.socket.onmessage = function (evt) {
        	var msg = $.parseJSON(evt.data);
           	callback(msg);
        };
    };
	
    self.sendMessage = (function(message) {
        if (message != '') {
            self.socket.send(message);
        }
    });
};

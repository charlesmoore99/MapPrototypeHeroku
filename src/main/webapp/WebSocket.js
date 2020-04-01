
    var Channel = function(callback){
    	var self = this;
    	
    	self.socket = null;
    	
        self.connect = function(uri) {

            if ('WebSocket' in window) {
                self.socket = new WebSocket(uri);
            } else if ('MozWebSocket' in window) {
                self.socket = new MozWebSocket(uri);
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

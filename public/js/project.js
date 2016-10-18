var Project = function(directory, name, clientUUID) {
	var p = this;
	this.connectToWebsocketNotifier = function() {
		p.connect = function() {
		    p.ws = new WebSocket('ws://localhost:3000/sockets/projects/'+directory+'/'+project+'/' + clientUUID);
		    return p;
		};

		p.disconnect = function() {
		    p.ws.close();
		};

		p.listen = function() {
		    p.ws.addEventListener("message", function(e) {
		    p.write(JSON.parse(e.data), 'right');
		    });
		    p.ws.addEventListener("close", function(e) {
		        console.log("closed connection, reconnecting", e)
		        p.connect()
		    });
		    p.ws.addEventListener("error", function(e) {
		        console.log("error for connection", e)
		    });
		    return p;
		};
    }
}
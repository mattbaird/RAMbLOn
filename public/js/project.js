var Project = function(directory, name, clientUUID) {
	var p = this;
	this.directory = directory;
	this.name = name;
	this.clientUUID = clientUUID;
	p.connect();
}

Project.prototype.connect = function() {
    this.ws = new WebSocket('ws://localhost:3000/sockets/projects/'+this.directory+'/'+this.name+'/' + this.clientUUID);
    var _this = this
    this.ws.onopen = function(event) {
    	  var messageData = {
          typ: "notification",
          text: "client registering"
        };
		_this.ws.send(JSON.stringify(messageData));
    }
    console.log("listening");
    return this;
};

Project.prototype.disconnect = function() {
    this.ws.close();
};

Project.prototype.listen = function() {
    this.ws.addEventListener("message", function(e) {
    	this.write(JSON.parse(e.data), 'right');
    });
    this.ws.addEventListener("close", function(e) {
        console.log("closed connection, reconnecting", e)
        this.connect()
    });
    this.ws.addEventListener("error", function(e) {
        console.log("error for connection", e)
    });
    return this;
};
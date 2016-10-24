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
    return this;
};

Project.prototype.disconnect = function() {
    this.ws.close();
};

Project.prototype.listen = function() {
    console.log("listening");
    var _this = this

    this.ws.addEventListener("message", function(e) {
        var message = JSON.parse(e.data)
    	console.log(message);
        if (message.typ == "update") {
            location.reload();
        }
    });

    this.ws.addEventListener("close", function(e) {
        console.log("closed connection, reconnecting", e)
        _this.connect()
    });

    this.ws.addEventListener("error", function(e) {
        console.log("error for connection", e)
    });
    return this;
};
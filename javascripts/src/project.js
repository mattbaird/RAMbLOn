class Project {

  constructor(directory, name, clientUUID) {
    this.directory = directory;
    this.name = name;
    this.clientUUID = clientUUID;
    this.connect();
  }

  connect() {
    this.ws = new WebSocket('ws://localhost:3001/sockets/projects/'+this.directory+'/'+this.name+'/' + this.clientUUID);
    this.ws.onopen = e => {
      var messageData = {
        typ: "notification",
        text: "client registering"
      };
      this.ws.send(JSON.stringify(messageData));
    }
  }

  disconnect() {
    this.ws.close();
  }

  listen() {

    console.log("Listening for changes...");

    this.ws.addEventListener("message", function(e) {
      var message = JSON.parse(e.data)
      // console.log(message);
      if (message.typ == "update") {
        location.reload();
      }
    });

    this.ws.addEventListener("close", e => {
      console.log("Connection closed, attempting to reconnect...", e)
      this.connect()
    });

    this.ws.addEventListener("error", e => {
      console.warn("Connection encountered an error", e)
    });

  }

}

export default Project

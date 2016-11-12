var express = require('express'),
    http    = require('http'),
    app     = express(),
    server  = http.createServer(app),
    port    = 8080;

server.listen(port);

var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
	console.log("Client connected!")
});

app

  // Set up index
  .get('/', function(req, res) {

    res.sendFile(__dirname + '/index.html');

  });

// Log that the servers running
console.log("Server running on port: " + port);

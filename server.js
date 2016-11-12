var express = require('express'),
    http    = require('http'),
    app     = express(),
    server  = http.createServer(app),
    port    = 8080;

server.listen(port);

app

  // Set up index
  .get('/', function(req, res) {

    res.sendFile(__dirname + 'https://cdn.css-tricks.com/index.html');

  });

// Log that the servers running
console.log("Server running on port: " + port);

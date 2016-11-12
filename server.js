'use strict';

const express = require('express');
const socketIO = require('socket.io');
const path = require('path');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');

var game_sockets = {};
var controller_sockets = {}

const server = express()
  .use((req, res) => res.sendFile(INDEX) )
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const io = socketIO(server);

io.on('connection', (socket) => {

  socket.on('controller_connect', function(g_id) {

      console.log("Controller trying to connect to " + g_id)

      console.log("GameSocket[g_id]: " + game_sockets[g_id])
      console.log("Controller id: " + game_sockets[g_id].controller_id)

     if (game_sockets[g_id] && !game_sockets[g_id].controller_id) {
        controller_sockets[socket.id] = {
          socket: socket,
          game_id: g_id
        };

        game_sockets[g_id].controller_id = socket.id;
        game_sockets[g_id].socket.emit('controller_connected', true)
        socket.emit('controller_connected', true);
    } else {

      console.log("Controller attempted to connect but failed");
      socket.emit("controller_connected", false);

    }
  });

  socket.on('game_connect', function(){
    console.log("Game connected");

    game_sockets[socket.id] = {
      socket: socket,
      controller_id: undefined
    };

    socket.emit("game_connected");
  });

  socket.on('disconnect', () => console.log('Client disconnected'));
});




//setInterval(() => io.emit('time', new Date().toTimeString()), 1000);

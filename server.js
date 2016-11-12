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

  socket.on('disconnect', function () {

      // Game
      if (game_sockets[socket.id]) {

        console.log("Game disconnected");

        if (controller_sockets[game_sockets[socket.id].controller_id]) {

          controller_sockets[game_sockets[socket.id].controller_id].socket.emit("controller_connected", false);
          controller_sockets[game_sockets[socket.id].controller_id].game_id = undefined;
        }

        delete game_sockets[socket.id];
      }

      // Controller
      if (controller_sockets[socket.id]) {

        console.log("Controller disconnected");

        if (game_sockets[controller_sockets[socket.id].game_id]) {

          game_sockets[controller_sockets[socket.id].game_id].socket.emit("controller_connected", false);
          game_sockets[controller_sockets[socket.id].game_id].controller_id = undefined;
        }

        delete controller_sockets[socket.id];
      }
    });
});




//setInterval(() => io.emit('time', new Date().toTimeString()), 1000);

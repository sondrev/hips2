'use strict';

const express = require('express');
const socketIO = require('socket.io');
const path = require('path');

const PORT = process.env.PORT || 3000;
const CONTROLLER = path.join(__dirname, 'controller.html');
const BROWSER = path.join(__dirname, 'browser.html');

var r = undefined
var game_sockets = {};
var controller_sockets = {}

const server = express()
  .use((req, res) =>  {
    var game_id = req.query.id;
    if (game_id) {
      res.sendFile(CONTROLLER);
    } else {
      res.sendFile(BROWSER);
    }
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const io = socketIO(server);

io.on('connection', (socket) => {

  socket.on('move_right', function(game_ID) {
      console.log(socket.id + " tried to move right in game " + game_ID)
      var controller_id = socket.id;
      game_sockets[game_ID].socket.emit('move_right', controller_id)
  });
  socket.on('move_left', function(game_ID) {
      var controller_id = socket.id;
      game_sockets[game_ID].socket.emit('move_left', controller_id);
  });

  socket.on('controller_connect', function(g_id) {
      console.log("Controller trying to connect to " + g_id)

     if (game_sockets[g_id]) {
        controller_sockets[socket.id] = {
          socket: socket,
          game_id: g_id
        };

        game_sockets[g_id].controller_ids.push(socket.id);
        game_sockets[g_id].socket.emit('controller_connected', socket.id) // Inform game about new controller
        socket.emit('controller_connected',  socket.id); // Send confirmation to controllerSocket
    } else {
      console.log("Controller attempted to connect but failed");
      socket.emit("controller_disconnected",socket.id );
    }
  });

  socket.on('game_connect', function(){
      console.log("Adding game with id " + socket.id)
      game_sockets[socket.id] = {
        socket: socket,
        controller_ids: []
      };

      console.log("Game connected");
      socket.emit("game_connected");
  });

  socket.on('disconnect', function () {

      // Game disconnect
      if (game_sockets[socket.id]) {

        console.log("Game disconnected");

        //Tell all controllers that game disconnected
        for (let c_id in game_sockets[socket.id]) {
          if (controller_sockets[c_id]) {
              var conSocket = controller_sockets[c_id];
              conSocket.socket.emit("controller_disconnected", socket.id);
          }
        }

        delete game_sockets[socket.id];
      }

      // Controller disconnect
      if (controller_sockets[socket.id]) {

        console.log("Controller disconnected");
        var g_id = controller_sockets[socket.id].game_id;
        var game = game_sockets[g_id];
        if (game) {
          game.socket.emit("controller_disconnected", socket.id);
          game.controller_id = undefined;
        }

        delete controller_sockets[socket.id];
      }
    });
});

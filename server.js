'use strict';

const path = require('path');
const fs = require('fs');
const express = require('express');
const http = require('http');
const app = express();

const PORT = process.env.PORT || 8002;

const httpServer = http.createServer(app).listen(PORT);
const io = require("socket.io");
const server = io.listen(httpServer);

const apiClient = require('./clients/ApiChatClient');
const rabbitConsumer = require('./lib/rabbit/RabbitConsumer');
const mongoConsumer = require('./lib/rabbit/MongoConsumer');

server.on("connection", socket => {
    socket.emit('start', 'server starts...');
    console.info(`Client connected`);

    socket.on("disconnect", () => {
        console.info(`Client gone `);
    });

    socket.on("getMessages", async jwt => {
      try{
        const msgs = await apiClient.getMessages(jwt);
      }
      catch(err){
        console.log(err);
      }
    })

    socket.on("new-message", async (jwt, message) => {
        try{
          await apiClient.insertMessage(jwt, message);
        }
        catch(err){
          console.log(err);
        }
    });

    socket.on("rabbit-message", rabbitMessage => {
      socket.emit("send-rabbit-message-to-client", rabbitMessage);
      socket.broadcast.emit("send-rabbit-message-to-client", rabbitMessage);
    });

    socket.on("mongo-message", mongoMessage => {
      socket.emit("send-mongo-message-to-client", mongoMessage);
      socket.broadcast.emit("send-mongo-message-to-client", mongoMessage);
    });
});


app.use(express.json({extended: false}));
app.use(express.urlencoded({extended: false}));

app.disable('etag');

'use strict';

const path = require('path');
const fs = require('fs');
const express = require('express');
const http = require('http');
const app = express();
const jwt = require('jsonwebtoken');
const axios = require('axios');
const csv = require('csvtojson');

const PORT = process.env.PORT || 8002;

const httpServer = http.createServer(app).listen(PORT);
const io = require("socket.io");
const server = io.listen(httpServer);

const apiClient = require('./clients/ApiChatClient');
const QueueSender = require('./lib/rabbit/QueueSender');
const RabbitConsumer = require('./lib/rabbit/RabbitConsumer');

const validateMessage = async (message) => {
  if (message.search("/stock=") >= 0){
    const code = message.split("=")[1];
    const stooqResponse = await axios.get(`https://stooq.com/q/l/?s=${code}&f=sd2t2ohlcv&h&e=csv`);
    const {data} = stooqResponse;
    return csv({output: "json"}).fromString(data).then( row=>{
      const message = `${row[0].Symbol} quote is \$${row[0].Close}`;
      const newMessage = {name: "bot", status:message};
      QueueSender.send('chat-queue', newMessage);
      return new Promise(resolve => resolve(newMessage));
    });
  }
}

server.on("connection", socket => {
    socket.emit('start', 'server starts...');
    console.info(`Client connected`);

    socket.on("disconnect", () => {
        console.info(`Client gone `);
    });

    socket.on("getMessages", async token => {
      try{
        const msgs = await apiClient.getMessages(token);
      }
      catch(err){
        console.log(err);
      }
    })

    socket.on("new-message", async (token, message) => {
        try{
            const decoded = jwt.verify(token, "mysecret");
            // console.log(message);
            // console.log(decoded);
          //const user = await apiClient.insertMessage(jwt, message);
            QueueSender.send('chat-queue',{name:decoded.user, status:message});
            await validateMessage(message);

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

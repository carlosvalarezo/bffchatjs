const amqp = require('amqplib/callback_api');
const apiClient = require('../../clients/ApiChatClient');
const io = require("socket.io-client");
const ioClient = io.connect("http://localhost:8000");


amqp.connect('amqp://guest:guest@localhost', (error0, connection) => {
    connection.createChannel((error1, channel) => {
        channel.assertQueue('mongo-queue', {
          durable: true
        });
        channel.consume('mongo-queue', async msg => {
          const {message} = JSON.parse(msg.content.toString());
          const {status} = message;
          ioClient.emit('mongo-message', {message: status});
        },{
            noAck: false
        });

    });
  });

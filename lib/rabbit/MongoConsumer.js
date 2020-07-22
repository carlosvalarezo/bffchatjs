const amqp = require('amqplib/callback_api');
const apiClient = require('../../clients/ApiChatClient');
const io = require("socket.io-client");
const ioClient = process.env.DEPLOY
                ? io.connect("http://chatserver:8001")
                : io.connect("http://localhost:8001");

const RABBIT_SERVER = proces.env.DEPLOY
                      ? 'amqp://guest:guest@rabbitmq'
                      : 'amqp://guest:guest@localhost'


amqp.connect(RABBIT_SERVER, (error0, connection) => {
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

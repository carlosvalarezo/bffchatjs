const amqp = require('amqplib/callback_api');
const moment = require('moment');
const io = require("socket.io-client");
const ioClient = process.env.DEPLOY
                ? io.connect("http://chatserver:8002")
                : io.connect("http://localhost:8002");

const RABBIT_SERVER = process.env.DEPLOY
                      ? 'amqp://guest:guest@rabbitmq'
                      : 'amqp://guest:guest@localhost'


amqp.connect(RABBIT_SERVER, (error0, connection) => {
    connection.createChannel((error1, channel) => {
        channel.assertQueue('chat-queue', {
          durable: true
        });
        channel.consume('chat-queue', msg => {
          const {message, time} = JSON.parse(msg.content.toString());
          const {status} = message;
          const formattedTime = moment(time).format("DD-MM-YYYY h:mm:ss");
          console.log("nuevo mensaje")
          // console.log(message)
          ioClient.emit("rabbit-message", message);
        },{
            noAck: false
        });
    });
  });

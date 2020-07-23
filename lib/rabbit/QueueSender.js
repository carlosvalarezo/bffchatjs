const amqp = require('amqplib/callback_api');
const RABBITMQ_SERVER = process.env.DEPLOY
                        ? "amqp://guest:guest@rabbitmq"
                        : "amqp://guest:guest@localhost";

const send = (queue, message) => {
  amqp.connect(RABBITMQ_SERVER, (error0, connection) => {
    if(error0){console.log(error0); process.exit(1)}
      connection.createChannel((error1, channel) => {
           if(error1){console.log(error1); process.exit(1)}
            channel.assertQueue(queue, {
              durable: true
            });
          const messageSubmitted = JSON.stringify({time: Date.now(),message});
          channel.sendToQueue(queue, Buffer.from(messageSubmitted), {persistent: true});
          channel.close();
      });
  });
}
module.exports = {send};

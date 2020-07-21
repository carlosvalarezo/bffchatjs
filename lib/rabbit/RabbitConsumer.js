const amqp = require('amqplib/callback_api');
const apiClient = require('../../clients/ApiChatClient');

const rabbitConsumer = () => {
  return new Promise(resolve => {
    amqp.connect('amqp://guest:guest@localhost', (error0, connection) => {
        connection.createChannel((error1, channel) => {
            channel.assertQueue('chat-queue', {
              durable: true
            });
            channel.consume('chat-queue', msg => {
              const {message, time} = JSON.parse(msg.content.toString());
              resolve({message, time});

            },{
                noAck: false
            });
        });
      });
  });
}

module.exports = {rabbitConsumer};

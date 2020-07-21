const amqp = require('amqplib/callback_api');
const apiClient = require('../../clients/ApiChatClient');

const mongoConsumer = () => {
  return new Promise(resolve => {
    amqp.connect('amqp://guest:guest@localhost', (error0, connection) => {
        connection.createChannel((error1, channel) => {
            channel.assertQueue('mongo-queue', {
              durable: true
            });
            channel.consume('mongo-queue', async msg => {
              const {message} = JSON.parse(msg.content.toString());
              const {status} = message;
              if(status === 'new'){
                try{
                  const {jwt} = message;
                  const mongoMessages = await apiClient.getMessages(jwt);
                  const {status} = mongoMessages.data;
                  resolve({mongo: status});
                }catch(err){
                  console.log(err);
                }
              }
            },{
                noAck: false
            });

        });
      });
  });
}

module.exports = {mongoConsumer};

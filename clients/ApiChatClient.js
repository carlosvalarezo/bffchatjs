const axios = require('axios');
const https = require('https');
const fs = require('fs');

const SERVER = process.env.DEPLOY
               ? 'http://chatserver:8001/message'
               : 'http://localhost:8001/message'

const getMessages = async jwt => {
  return await axios.get(SERVER, {
                 headers: {'x-auth-token': jwt}});

}

const insertMessage = async (jwt, message) => {

  const data = {message};
  const headers = {'x-auth-token': jwt};

  await axios.post(SERVER,
                 data, {headers});
}

module.exports = {getMessages, insertMessage};

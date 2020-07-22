const axios = require('axios');
const https = require('https');
const fs = require('fs');

const getMessages = async jwt => {
  return await axios.get('http://localhost:8001/message', {
                 headers: {'x-auth-token': jwt}});

}

const insertMessage = async (jwt, message) => {

  const data = {message};
  const headers = {'x-auth-token': jwt};

  await axios.post('http://localhost:8001/message',
                 data, {headers});
}

module.exports = {getMessages, insertMessage};

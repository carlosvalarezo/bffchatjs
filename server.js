const io = require("socket.io-client"),
      ioClient = io.connect("http://localhost:3000");
ioClient.on('connection', a => console.log(a))
ioClient.on("seq-num", (msg) => console.info(msg));
ioClient.on("message", greet => console.log(greet))

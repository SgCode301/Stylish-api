const socket = require("socket.io");
const chatSocketController = require("../controller/ChatSocketController");
const socketUserStatusHandlers = require("./socketUserStatusHandlers");
const {authenticateSocket} = require("../controller/ChatSocketController");
const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  chatSocketController(io);
   io.use(authenticateSocket);
  io.on("connection", (socket) => {
    console.log("New connection established:", socket.id);
    
    socketUserStatusHandlers(io, socket);
  });

  return io;
};

module.exports = initializeSocket;

const  socket  =  require("socket.io");
const audioCallHandlers  =  require("../helper/audioCall");
const {authenticateSocket,chatHandlers} = require("../helper/chat");
const  videoCallHandlers  =  require("../helper/videoCall");
const socketUserStatusHandlers = require("./socketUserStatusHandlers");

const  initializeSocket  =  (server) =>{
     const  io  =  socket(server , {
         cors: {
           origin: "*",
           methods: ["GET", "POST"],
         },
     })
    io.use(authenticateSocket);
     io.on("connection" , (socket)=>{
             console.log("some-one connected  successfully")
            //  audioCallHandlers(io, socket);
            //  videoCallHandlers(io, socket);
            //  chatHandlers(io, socket);
            socketUserStatusHandlers(io, socket);
            
           

     })
     return io
}

module.exports  =  initializeSocket
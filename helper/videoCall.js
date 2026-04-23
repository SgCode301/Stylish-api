// function videoCallHandlers(io, socket) {
//   socket.on("join", (roomId) => {
//     socket.join(roomId);
//     socket.to(roomId).emit("user-joined", socket.id);
//   });

//   socket.on("offer", (data) => {
//     socket.to(data.roomId).emit("offer", data);
//   });

//   socket.on("answer", (data) => {
//     socket.to(data.roomId).emit("answer", data);
//   });

//   socket.on("ice-candidate", (data) => {
//     socket.to(data.roomId).emit("ice-candidate", data);
//   });
// }

// module.exports = videoCallHandlers;


const Call = require("../models/Call");
const mongoose = require("mongoose");

function videoCallHandlers(io, socket) {
  socket.on("join", (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-joined", socket.id);
  });

  socket.on("offer", (data) => {
    socket.to(data.roomId).emit("offer", data);
  });

  socket.on("answer", (data) => {
    socket.to(data.roomId).emit("answer", data);
  });

  socket.on("ice-candidate", (data) => {
    socket.to(data.roomId).emit("ice-candidate", data);
  });

  socket.on("video-call-connected", (data) => {
    const startTime = new Date().toISOString();
    const payload = { ...data, startTime };
    io.in(data.roomId).emit("video-call-connected", payload);
  });

  socket.on("video-call-ended", async (data) => {
    try {
      const endTime = new Date().toISOString();
      const duration = data.startTime
        ? Math.floor((new Date(endTime) - new Date(data.startTime)) / 1000)
        : null;

      const payload = {
        ...data,
        endTime,
        duration,
      };

      io.in(data.roomId).emit("video-call-ended", payload);

      const call = new Call({
        callerId: new mongoose.Types.ObjectId(data.callerId),
        calleeId: new mongoose.Types.ObjectId(data.calleeId),
        type: 'video',
        startTime: data.startTime,
        endTime: endTime,
        duration: duration,
      });

      await call.save();
      console.log("Video call with duration saved to DB");

    } catch (err) {
      console.error("Error saving video call:", err);
    }
  });
}

module.exports = videoCallHandlers;


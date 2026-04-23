const Call = require("../models/Call");

function audioCallHandlers(io, socket) {
  const userId = String(socket.userId || "");

  if (userId) {
    socket.join(`user:${userId}`);
    console.log(`✅ User ${userId} connected backend`);
  }

  // Invite a doctor to call -> create Call entry
  socket.on("call:invite", async ({ roomId, toUserId, type = "audio", bookingId }) => {
    console.log(`📞 ${userId} is calling ${toUserId}`);
    socket.join(roomId);

    try {
      // Create new Call in DB
      const call = await Call.create({
        callerId: userId,
        calleeId: toUserId,
        bookingId,
        roomId,
        type,
      });

      console.log("✅ Call saved in DB:", call._id);

      io.to(`user:${toUserId}`).emit("call:incoming", {
        roomId,
        fromUserId: userId,
        type,
        bookingId,
        callId: call._id,
      });
    } catch (err) {
      console.error("❌ Error saving call:", err.message);
      socket.emit("call:error", { message: "Could not save call" });
    }
  });

  // Doctor accepts -> update call startTime
  socket.on("call:accept", async ({ roomId }) => { 
    console.log(`✅ Call accepted by ${userId}`);
    socket.join(roomId);

    try {
      const call = await Call.findOneAndUpdate(
        { roomId, endTime: null },
        { startTime: new Date() },
        { new: true }
      );

      if (call) {
        console.log("📌 Call startTime updated:", call._id);
      }

      io.in(roomId).emit("call:accepted", { roomId, byUserId: userId });
    } catch (err) {
      console.error("❌ Error updating call accept:", err.message);
    }
  });

  // Doctor rejects -> just emit + close call
  socket.on("call:reject", async ({ roomId }) => {
    console.log(`❌ Call rejected by ${userId}`);

    try {
      await Call.findOneAndUpdate(
        { roomId, endTime: null },
        { endTime: new Date(), duration: 0 }
      );
    } catch (err) {
      console.error("❌ Error saving reject:", err.message);
    }

    io.in(roomId).emit("call:rejected", { roomId, byUserId: userId });
  });

  // Cancel by caller -> mark as ended
  socket.on("call:cancel", async ({ roomId }) => {
    console.log(`🚫 Call canceled by ${userId}`);

    try {
      await Call.findOneAndUpdate(
        { roomId, endTime: null },
        { endTime: new Date(), duration: 0 }
      );
    } catch (err) {
      console.error("❌ Error saving cancel:", err.message);
    }

    io.in(roomId).emit("call:canceled", { roomId, byUserId: userId });
  });

  // Ended after connection -> update endTime + duration
  socket.on("call:end", async ({ roomId }) => {
    console.log(`🔚 Call ended in room ${roomId} by ${userId}`);

    try {
      const call = await Call.findOne({ roomId }).sort({ createdAt: -1 });

      if (call && call.startTime && !call.endTime) {
        const endTime = new Date();
        const duration = Math.floor((endTime - call.startTime) / 1000);

        call.endTime = endTime;
        call.duration = duration;
        await call.save();

        console.log("✅ Call ended:", call._id, "Duration:", duration, "sec");

        io.in(roomId).emit("call:ended", {
          roomId,
          callId: call._id,
          duration,
        });
      }
    } catch (err) {
      console.error("❌ Error ending call:", err.message);
    }
  });

  // WebRTC events (direct relay)
  socket.on("call-offer", (data) => {
    socket.to(data.roomId).emit("call-offer", data);
  });
  socket.on("call-answer", (data) => {
    socket.to(data.roomId).emit("call-answer", data);
  });
  socket.on("call-candidate", (data) => {
    socket.to(data.roomId).emit("call-candidate", data);
  });

  socket.on("disconnect", () => {
    console.log(`🔌 User ${userId} disconnected`);
  });
}

module.exports = audioCallHandlers;

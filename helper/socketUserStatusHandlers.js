const User = require('../models/User'); // Adjust path as needed

function socketUserStatusHandlers(io, socket) {
  const userId = String(socket.userId || socket.data?.userId || "");

  // Set status online on connect
  if (userId) {
    User.findByIdAndUpdate(userId, { status: "online" }, { new: true }).exec();
    io.emit("user:status", { userId, status: "online" });
  }

  // Client sets status (online/offline/busy)
  socket.on("user:setStatus", async ({ status }) => {
    if (!userId || !["online", "offline", "busy"].includes(status)) return;
    await User.findByIdAndUpdate(userId, { status }, { new: true }).exec();
    io.emit("user:status", { userId, status });
  });

  // Client gets status for a user
  socket.on("user:getStatus", async ({ userId: queryId }) => {
    if (!queryId) return;
    const user = await User.findById(queryId).select("status").lean();
    socket.emit("user:status", { userId: queryId, status: user?.status || "offline" });
  });

  // On disconnect, set status to offline
  socket.on("disconnect", async () => {
    if (userId) {
      await User.findByIdAndUpdate(userId, { status: "offline" }, { new: true }).exec();
      io.emit("user:status", { userId, status: "offline" });
    }
  });
}

module.exports = socketUserStatusHandlers;

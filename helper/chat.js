// helper/chat.js
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');
const Chat = require('../models/Chat');
const Room = require('../models/Room');

function authenticateSocket(socket, next) {
  const token = socket.handshake.auth.token;
  console.log(token);
  if (!token) {
    return next(new Error('Authentication error: token missing'));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || config.jwt.secretKey);
    socket.userId = decoded._id;
    return next();
  } catch (err) {
    return next(new Error('Authentication error'));
  }
}

async function updateUserStatus(userId, status) {
  try {
    await User.findByIdAndUpdate(userId, { status });
  } catch (err) {
    console.error(`Error updating status for user ${userId}:`, err);
  }
}

/**
 * Get or create a room between two users
 */
async function getOrCreateRoom(userId, otherUserId) {
  let room = await Room.findOne({
    participants: { $all: [userId, otherUserId], $size: 2 }
  });

  if (!room) {
    room = new Room({ participants: [userId, otherUserId] });
    await room.save();
  }

  return room;
}

/**
 * Handle incoming chat messages
 */
async function handleChatMessage(socket, data, io) {
  try {
    const { roomId, message } = data;

    // Ensure room exists between sender and receiver
    if (!roomId) {
      console.error("Message missing roomId");
      return;
    }

    await updateUserStatus(socket.userId, "online");

    // Save message in DB
    const chatMessage = new Chat({
      roomId,
      sender: socket.userId,
      message,
    });
    await chatMessage.save();

    // Emit message to everyone in the room
    io.to(roomId.toString()).emit('chatMessage', {
      sender: socket.userId,
      message,
      roomId,
      timestamp: chatMessage.createdAt,
    });
  } catch (err) {
    console.error('Error handling chat message:', err);
  }
}

function handleDisconnect(socket) {
  console.log(`User disconnected: ${socket.userId}`);
  updateUserStatus(socket.userId, 'offline');
}

function chatHandlers(io, socket) {
  updateUserStatus(socket.userId, 'online');

  // ✅ Notify others that this user came online
  socket.broadcast.emit("userOnline", {
    userId: socket.userId,
    message: `User ${socket.userId} is online`
  });

  // When a user selects another user (doctor/patient), join their room
  socket.on("joinRoom", ({ roomId }) => {
    socket.join(roomId.toString());
    console.log(`User ${socket.userId} joined room ${roomId}`);
  });


  // When sending a message
  socket.on('chatMessage', (data) => {
    handleChatMessage(socket, data, io);
  });

  socket.on('disconnect', () => {
    handleDisconnect(socket);
    // ✅ Notify others that user went offline
    socket.broadcast.emit("userOffline", {
      userId: socket.userId,
      message: `User ${socket.userId} went offline`
    });
  });
}

module.exports = {
  authenticateSocket,
  updateUserStatus,
  handleChatMessage,
  handleDisconnect,
  chatHandlers,
};

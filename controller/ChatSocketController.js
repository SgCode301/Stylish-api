const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');
const Chat = require('../models/ChatMessage');

/**
 * Authenticate the socket connection by verifying the JWT token.
 * @param {Object} socket - The socket instance.
 * @param {Function} next - Callback to proceed to the next middleware.
 */

function authenticateSocket(socket, next) {
  const token = socket.handshake.query.token || socket.handshake.auth?.token;
  
  if (!token) {
    console.log("❌ Authentication failed: Token missing");
    return next(new Error('Authentication error: token missing'));
  }
  try {
    const decoded = jwt.verify(token, config.jwt.jwtSecret);
    // Save the user ID on the socket object for future use.
    socket.userId = decoded._id;
    console.log("✅ Authenticated user:", socket.userId);
    return next();
  } catch (err) {
    console.log("❌ Authentication failed: Invalid token", err.message);
    return next(new Error('Authentication error'));
  }
}

/**
 * Update the status of a user in the database.
 * @param {String} userId - The user ID.
 * @param {String} status - The new status (online/offline).
 */

async function updateUserStatus(userId, status) {
  try {
    await User.findByIdAndUpdate(userId, { status });
  } catch (err) {
    console.error(`Error updating status for user ${userId}:`, err);
  }
}

/**
 * Handle an incoming chat message: save it to the database and emit to the receiver.
 * @param {Object} socket - The sender's socket instance.
 * @param {Object} data - Message data with { receiverId, message }.
 * @param {Object} io - The Socket.IO instance.
 */
async function handleChatMessage(socket, data, io) {
  try {
    const chatMessage = new Chat({
      sender: socket.userId,
      receiver: data.receiverId,
      message: data.message,
    });
    await chatMessage.save();
    console.log(data);
    // Emit the message to the receiver's room.
    console.log({
      receiver: data.receiverId,
      sender: socket.userId,
      message: data.message,
      createdAt: chatMessage.createdAt,
    })
    io.to(data.receiverId.toString()).emit('chatMessage', {
      receiver: data.receiverId,
      sender: socket.userId,
      message: data.message,
      createdAt: chatMessage.createdAt,
    });
  } catch (err) {
    console.error('Error handling chat message:', err);
  }
}

/**
 * Handle socket disconnect event by updating the user's status to offline.
 * @param {Object} socket - The socket instance.
 */
function handleDisconnect(socket) {
  console.log(`User disconnected: ${socket.userId}`);
  updateUserStatus(socket.userId, 'offline');
}

/**
 * Main function to initialize chat socket events.
 * @param {Object} io - The Socket.IO instance.
 */
module.exports = function (io) {
  // Use the authentication middleware for all socket connections.
  io.use(authenticateSocket);

  io.on('connection', (socket) => {

    // Set user status to online and join a room with their user ID.
    console.log(`User connected: ${socket.userId}`);
    updateUserStatus(socket.userId, 'online');
    socket.join(socket.userId.toString());

    // Listen for incoming chat messages.
    socket.on('chatMessage', (data) => {
      handleChatMessage(socket, data, io);
    });

    // Listen for disconnect events.
    socket.on('disconnect', () => {
      handleDisconnect(socket);
    });
  });
};

//   io.use((socket, next) => {
//     const token = socket.handshake.auth?.token;


//     if (!token) {
//       return next(new Error("Authentication error: token missing"));
//     }

//     try {
//       const decoded = jwt.verify(token, config.jwtSecret.jwtSecret);

//       socket.userId = decoded._id;

//       console.log(" JWT verified, userId:", decoded._id);
//       next();
//     } catch (err) {
//       console.log(" JWT verify failed:", err.message);
//       next(new Error("Authentication error"));
//     }
//   });

//   io.on("connection", (socket) => {
//     console.log("User connected:", socket.userId);

//     socket.join(socket.userId.toString());

//     socket.on("message", (data) => {
//       console.log("Message received:", data);

//       socket.emit("message", {
//         msg: "Message received on server",
//         data
//       });
//     });

//     socket.on("disconnect", () => {
//       console.log("User disconnected:", socket.userId);
//     });
//   });
// };
const BaseController = require("../core/BaseController");
const Room = require("../models/Room");
const config = require("../config/config");
const User = require("../models/User"); // in case we want to validate user IDs

const roomController = new BaseController(Room, {
  name: "room",
  access: "admin",
  accessKey: "admin",
  get: {
    pagination: config.pagination,
  },
});

/**
 * Custom function: Get or create room between logged-in user and other user
 */
roomController.getOrCreateRoom = async (req, res) => {
  try {
    const userId = req.user._id; // injected by authMiddleware
    const { otherUserId } = req.body;

    console.log("userId:", userId, "otherUserId:", otherUserId);

    if (!otherUserId) {
      return res.status(400).json({ message: "otherUserId is required" });
    }

    // find existing room
    let room = await Room.findOne({
      participants: { $all: [userId, otherUserId], $size: 2 },
    });

    // create if not found
    if (!room) {
      room = new Room({ participants: [userId, otherUserId] });
      await room.save();
    }

    res.json(room);
  } catch (err) {
    console.error("Error in getOrCreateRoom:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get all rooms for logged-in user
 */
roomController.getMyRooms = async (req, res) => {
  try {
    const userId = req.user._id;

    const rooms = await Room.find({
      participants: userId,
    })
      .populate("participants", "name email") // only return name & email
      .sort({ updatedAt: -1 }); // latest active room first

    res.json(rooms);
  } catch (err) {
    console.error("Error in getMyRooms:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = roomController;

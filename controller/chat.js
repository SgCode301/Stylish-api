const BaseController = require("../core/BaseController");
const Chat = require("../models/Chat");
const config = require("../config/config");

const chatController = new BaseController(Chat, {
  name: "chat",
  access: "admin",
  accessKey: "admin",
  get: {
    pagination: config.pagination,
    query: ["title"],
  },
});

/**
 * Custom function: Get messages by roomId
 */
chatController.getMessagesByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    if (!roomId) {
      return res.status(400).json({ message: "roomId is required" });
    }

    const messages = await Chat.find({ roomId })
      .populate("sender", "name email") // populate sender info
      .sort({ createdAt: 1 }); // oldest → newest

    res.json(messages);
  } catch (err) {
    console.error("Error in getMessagesByRoom:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = chatController;

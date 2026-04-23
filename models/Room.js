// models/Room.js
const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema(
  {
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", RoomSchema);

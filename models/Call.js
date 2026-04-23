const mongoose = require("mongoose");
const { Schema } = mongoose;

const CallSchema = new Schema(
  {
    callerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    calleeId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    bookingId: {
      type: String,
      // ref: "Booking",
      // required: true,
      // index: true,
    },
    roomId: { type: String, required: true, index: true }, // signaling/ZEGO room
    type: { type: String, enum: ["audio", "video"], required: true }, // call kind
    startTime: { type: Date, default: null, index: true }, // set on connect
    endTime: { type: Date, default: null }, // set on end
    duration: { type: Number, default: 0, min: 0 }, // seconds (auto)
  },
  { timestamps: true }
);

// Helpful indexes
CallSchema.index({ roomId: 1, createdAt: -1 });
CallSchema.index({ callerId: 1, createdAt: -1 });
CallSchema.index({ calleeId: 1, createdAt: -1 });

module.exports = mongoose.model("Call", CallSchema);

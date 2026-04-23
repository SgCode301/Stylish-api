const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    star: {
      type: Number,
    },
    message: {
      type: String,
    },
    doctor: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);

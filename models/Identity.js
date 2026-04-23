const mongoose = require("mongoose");

const identitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
}, { timestamps: true });


module.exports = mongoose.model("Identity", identitySchema);

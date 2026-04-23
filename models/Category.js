const mongoose = require("mongoose");
//category title  description image
const categorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  image: {
    type: String
  },
});

categorySchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Category", categorySchema);

const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    image: {
      type: String,
    },
    description: {
      type: String,
    },
    content: {
      type: String,
    },
    author: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    like: {
      type: Number,
    },
    view: {
      type: Number,
    },
    comment: {
      type: Number,
    },
    category: {
      type: mongoose.Types.ObjectId,
      ref: "Category",
    },
  },
  { timestamps: true }
);

blogSchema.index({ title: 'text', description: 'text', content: 'text' });

module.exports = mongoose.model("Blog", blogSchema);

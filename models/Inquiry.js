const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    trim: true
  },

  message: {
    type: String,
    required: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

}, { timestamps: true }); // This will automatically add `createdAt` and `updatedAt`

module.exports = mongoose.model('Inquiry', inquirySchema);

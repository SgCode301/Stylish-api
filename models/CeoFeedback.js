const mongoose = require('mongoose');
const { Schema } = mongoose;

const CeoFeedbackSchema = new Schema(
  {
    // Who submitted (optional if anonymous)
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
      index: true,
    },
    star: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    }
  },
  { timestamps: true }
);


CeoFeedbackSchema.index({ content: 'text' });

module.exports = mongoose.model('CeoFeedback', CeoFeedbackSchema);

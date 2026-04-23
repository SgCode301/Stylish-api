const mongoose = require('mongoose');
const { Schema } = mongoose;

const TrackCallSchema = new Schema(
  {
    // Who participated
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    psychologistId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Booking linkage
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'DoctorBookingSlot',
      required: true,
      index: true,
    },

    // Call metadata
    callType: {
      type: String,
      enum: ['audio', 'video'],
      default: 'video',
      index: true,
    },
    status: {
      type: String,
      enum:['new' , 'process' , 'end'],
      default: 'new',
      index: true,
    },

    // Timing
    startTime: {
      type: Date,
      required: true,
      index: true,
    },
    endTime: {
      type: Date,
      default: null,
    },

    // Duration in seconds, auto-computed when endTime is set
    durationSeconds: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Optional diagnostics
    reason: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },

    // Optional signaling/session identifiers (useful for vendor integration)
    roomId: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    externalCallId: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
  },
  { timestamps: true }
);

// Validate times
TrackCallSchema.path('endTime').validate(function (value) {
  if (!value) return true;
  if (!this.startTime) return true;
  return value >= this.startTime;
}, 'endTime cannot be earlier than startTime');


// Useful compound indexes
TrackCallSchema.index({ userId: 1, createdAt: -1 });
TrackCallSchema.index({ psychologistId: 1, createdAt: -1 });
TrackCallSchema.index({ bookingId: 1, startTime: -1 });

module.exports = mongoose.model('TrackCall', TrackCallSchema);

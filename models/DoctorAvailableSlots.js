const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DoctorAvailableSlotsSchema = new Schema({
  doctor: {
    type: Schema.Types.ObjectId,
    ref: 'User', // assuming doctor is a User with role 'doctor'
    required: true
  },
  date: {
    type: Date, // e.g., 2025-06-17
    required: true
  },
  session: {
    type: String,
    enum: ['morning', 'afternoon', 'evening'],
    required: true
  },
  slots: [{
    time: { type: String, required: true }, // e.g., "2:00 PM"
    isBooked: { type: Boolean, default: false },
    bookedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  }],
  languageSupport: {
    type: [String], // e.g., ["Hindi", "English"]
    default: []
  }
}, { timestamps: true });

DoctorAvailableSlotsSchema.index({ doctor: 1, date: 1, session: 1 }, { unique: true });

module.exports = mongoose.model('DoctorAvailableSlots', DoctorAvailableSlotsSchema);

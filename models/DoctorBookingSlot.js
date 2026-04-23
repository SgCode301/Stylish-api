const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Type = {
  CHAT: 'chat',
  CALL: 'call',
  VIDEO: 'video'
};

const DoctorBookingSlotSchema = new Schema({
  doctor: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Assuming doctors are users with role 'doctor'
    required: true
  },
  patient: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Patient booking the appointment
    required: true
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  timeSlot: {
    type: String, // e.g., "2:00 PM", "5:30 PM"
    required: true
  },
  session: {
    type: String
  },
  type: {
    type: String,
    enum: Object.values(Type),
    required: true,
  },
  status: {
    type: String,
    enum: ['booked', 'cancelled', 'completed'],
    default: 'booked'
  },
  languagePreference: {
    type: [String], // e.g., ['Hindi', 'English']
    default: []
  },
  bookedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('DoctorBookingSlot', DoctorBookingSlotSchema);

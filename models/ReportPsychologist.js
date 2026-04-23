const mongoose = require('mongoose');


const reportPsychologistSchema = new mongoose.Schema({
    psychologist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DoctorBookingSlot',
        required: true,
    },
    historyTitle: {
        type: String
    },
    historyDescription: {
        type: String
    },
    fullName: {
        type: String,
    },
    education: {
        type: String,
    },
    profession: {
        type: String
    },
    dob: {
        type: String
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
    },
    phone: {
        type: String
    },
    email: {
        type: String,
    },
    address: {
        type: String
    },
    maritalStatus: {
        type: String,
        enum: ['Single', 'Married', 'Divorced', 'Widowed'],
    },
    emergencyContact: {
        type: String,
    },
    presentingIssue: {
        type: [String]
    },
    caseHistory: {
        type: String,
        default: '',
    },
    country: {
        type: String,
    },
    followUp: {
        type: String,
    }
}, { timestamps: true })

module.exports = mongoose.model('ReportPsychologist', reportPsychologistSchema);
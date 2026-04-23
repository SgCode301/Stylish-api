const BaseController = require("../core/BaseController");
const Appointment = require("../models/Appointment");
const config = require("../config/config");

// For patients to see appointments where they are the 'user'
const patientAppointmentController = new BaseController(Appointment, {
  name: 'appointment',
  access: 'user',
  accessKey: 'user', // Filters by user field
  get: {
    pagination: config.pagination,
    populate: [
      { path: 'psychologist', select: 'fullName email phoneNo' },
      { path: 'user', select: 'fullName email phoneNo' },
      { path: 'transaction', select: 'amount status' }
    ]
  },
});

// For psychologists to see appointments where they are the 'psychologist'
const psychologistAppointmentController = new BaseController(Appointment, {
  name: 'appointment',
  access: 'user',
  accessKey:'psychologist', // Filters by psychologist field
  get: {
    pagination: config.pagination,
    populate: [
      { path: 'user', select: 'fullName email phoneNo' },
      { path: 'psychologist', select: 'fullName email phoneNo' },
      { path: 'transaction', select: 'amount status' }
    ]
  },
});

module.exports = {
  patientAppointmentController,
  psychologistAppointmentController
};
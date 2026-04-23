const BaseController = require('../core/BaseController');
const DoctorAvailableSlots = require('../models/DoctorAvailableSlots');
const config = require('../config/config');

const doctorAvailableSlotsController = new BaseController(DoctorAvailableSlots, {
  name: 'DoctorAvailableSlots',
  access: 'user',
  accessKey: 'doctor',
  get: {
    pagination: config.pagination,
    query:["doctor","date","session"]
  },
});

const doctorAvailableSlotsPublicController = new BaseController(DoctorAvailableSlots, {
  name: 'DoctorAvailableSlots',
  get: {
    pagination: config.pagination,
    query:["doctor","date","session"]
  },
});

module.exports = {doctorAvailableSlotsController, doctorAvailableSlotsPublicController};

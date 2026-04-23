const BaseController = require('../core/BaseController');
const ReportPsychologist = require('../models/ReportPsychologist');
const DoctorBookingSlot = require('../models/DoctorBookingSlot')
const config = require('../config/config');

const getBooking = async (req, res) => {
  try {
    const booking = await ReportPsychologist.findOne({ booking: req.params.id });
    if (!booking) {
      const returnDoc = await DoctorBookingSlot.findOne({ _id: req.params.id });
      if (!returnDoc) {
        return res.status(404).json({ error: 'Booking not found' });
      }
      return res.status(200).json({
        message: "Booking found successfully",
        booking: returnDoc
      });
    }
    return res.status(200).json({
      message: "Report found successfully",
      booking
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

const psychologistController = new BaseController(ReportPsychologist, {
  name: 'reportPsychologist',
  access: 'user',
  accessKey: 'psychologist',
  get: {
    pagination: config.pagination,
    sort: { createdAt: -1 },
    query: ['customer', 'psychologist', "call"],
    searchFields: ['fullName'],
    populate:[{path:"customer",select:"userImage name"}]

  },
  //  getById: {
  //   query: ['customer','psychologist',"call"],
  // },
})

const adminReportPsychologistController = new BaseController(ReportPsychologist, {
  name: 'reportPsychologist',
  access: 'admin',
  get: {
    pagination: config.pagination,
    sort: { createdAt: -1 },
    query: ['customer', 'psychologist', "call"],
    searchFields: ['fullName'],
    populate:[{path:"customer",select:"userImage name"}]


  },
  //  getById: {
  //   query: ['customer','psychologist',"call"],
  // },
})



module.exports = { adminReportPsychologistController, getBooking, psychologistController };
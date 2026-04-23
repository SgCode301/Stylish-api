const BaseController = require('../core/BaseController');
const DoctorBookingSlot = require('../models/DoctorBookingSlot');
const DoctorAvailableSlots = require('../models/DoctorAvailableSlots');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const sendNotification = require("../utils/sendNotification");

const config = require('../config/config');

const doctorBookingSlotController = new BaseController(DoctorBookingSlot, {
  name: 'doctorBookingSlot',
  access: 'user',
  accessKey: 'patient',
  get: {
    pagination: config.pagination,
    query: ["type", "status", "doctor", "patient", "appointmentDate"],
    populate: [
      { path: 'doctor', 
        select: 'name email phoneNo gender dob averageRating totalReviews userImage languages address bio specialization education experience chatCharge callCharge  videoCharge  chatTime callTime',
        populate: [
        // { path: 'type', select: 'title' },
        { path: 'languages', select: 'title' },
        { path: 'specialization', select: 'title' },
        // { path: 'identity', select: 'title' },
        // { path: 'concern', select: 'title' },
        // { path: 'experience', select: 'title' }
      ],
       },
      { path: 'patient', select: 'name email phoneNo userImage' }
    ]
  },
});

const doctorBookingSlotControllerForPsychologist = new BaseController(DoctorBookingSlot, {
  name: 'doctorBookingSlot',
  access: 'user',
  accessKey: 'doctor',
  get: {
    pagination: config.pagination,
    query: ["type", "status", "doctor", "patient", "appointmentDate"],
    populate: [
      { path: 'doctor', select: 'name email phoneNo gender dob averageRating totalReviews userImage languages address bio specialization education experience chatCharge callCharge  videoCharge  chatTime callTime' },
      { path: 'patient', select: 'name email phoneNo gender dob averageRating totalReviews userImage languages address bio specialization education experience chatCharge callCharge  videoCharge  chatTime callTime' }
    ],
      pre: async (filter, req) => {
      filter.doctor = req.user._id;
      if (req.query.dateFrom || req.query.dateTo) {
        const start = req.query.dateFrom
          ? new Date(req.query.dateFrom)
          : new Date("1970-01-01");
        const end = req.query.dateTo ? new Date(req.query.dateTo) : new Date();
        end.setHours(23, 59, 59, 999);
        filter.appointmentDate = { $gte: start, $lte: end };
      }
    },
  },
});

// ----------------- Custom Function --------------------
doctorBookingSlotController.createBooking = async (req, res) => {
  try {
    const { doctor, appointmentDate, type, timeSlot, languagePreference = [] } = req.body;

    const userId = req.user && req.user._id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized: user id required' });

    const patient = userId;

    // Find the availability document
    const availability = await DoctorAvailableSlots.findOne({
      doctor,
      date: appointmentDate,
      'slots.time': timeSlot,
    });

    if (!availability) {
      return res.status(404).json({ message: 'Doctor is not available on this date and time.' });
    }

    // Find the specific slot
    const slot = availability.slots.find(slot => slot.time === timeSlot);

    if (!slot || slot.isBooked) {
      return res.status(409).json({ message: 'Slot already booked.' });
    }

    // Mark slot as booked
    slot.isBooked = true;
    slot.bookedBy = patient;
    await availability.save();

    // Create a booking
    const booking = await DoctorBookingSlot.create({
      doctor,
      patient,
      appointmentDate,
      timeSlot,
      type,
      languagePreference
    });

    return res.status(201).json({
      message: 'Booking successful',
      data: booking
    });

  } catch (error) {
    console.error('Booking Error:', error);
    return res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

doctorBookingSlotController.createBookingAdmin = async (req, res) => {
  try {
    const { patient, doctor, appointmentDate, type, timeSlot, languagePreference = [] } = req.body;

    // Find the availability document
    const availability = await DoctorAvailableSlots.findOne({
      doctor,
      date: appointmentDate,
      'slots.time': timeSlot,
    });

    if (!availability) {
      return res.status(404).json({ message: 'Doctor is not available on this date and time.' });
    }

    // Find the specific slot
    const slot = availability.slots.find(slot => slot.time === timeSlot);

    if (!slot || slot.isBooked) {
      return res.status(409).json({ message: 'Slot already booked.' });
    }

    // Mark slot as booked
    slot.isBooked = true;
    slot.bookedBy = patient;
    await availability.save();

    // Create a booking
    const booking = await DoctorBookingSlot.create({
      doctor,
      patient,
      appointmentDate,
      timeSlot,
      type,
      languagePreference
    });

    return res.status(201).json({
      message: 'Booking successful',
      data: booking
    });

  } catch (error) {
    console.error('Booking Error:', error);
    return res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

doctorBookingSlotController.bookSlotAndCreateTransaction = async (req, res) => {
  try {
    const {
      doctor,
      appointmentDate,
      type,
      timeSlot,
      session,
      languagePreference = [],
      amount,
      paymentId,
      message = 'Payment for consultation'
    } = req.body;

    const user = req.user && req.user._id;
    if (!user) return res.status(401).json({ message: 'Unauthorized: user ID required' });

    // Step 1: Check user's wallet balance
    const userDoc = await User.findById(user);
    if (!userDoc) return res.status(404).json({ message: 'User not found' });

    let psychologistDoc = await User.findById(doctor);
    if (!psychologistDoc) return res.status(404).json({ message: 'Doctor not found' });

    if (userDoc.wallet < amount) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }

    // Step 2: Find or create availability for doctor + date + session
    let availability = await DoctorAvailableSlots.findOne({
      doctor,
      date: appointmentDate,
      session
    });

    // If availability doesn't exist, create with this timeSlot
    if (!availability) {
      availability = new DoctorAvailableSlots({
        doctor,
        date: appointmentDate,
        session,
        slots: [{
          time: timeSlot,
          isBooked: true,
          bookedBy: user
        }],
        languageSupport: languagePreference
      });

      await availability.save();
    } else {
      // Step 2: Check if timeSlot already exists
      const existingSlot = availability.slots.find(slot => slot.time === timeSlot);

      if (existingSlot) {
        if (existingSlot.isBooked) {
          return res.status(409).json({ message: 'Slot already booked.' });
        }
        // If slot exists and not booked, mark it as booked
        existingSlot.isBooked = true;
        existingSlot.bookedBy = user;
      } else {
        // If slot doesn't exist, add it as booked
        availability.slots.push({
          time: timeSlot,
          isBooked: true,
          bookedBy: user
        });
      }

      await availability.save();
    }

    // Step 3: Deduct amount from wallet
    userDoc.wallet -= amount;
    await userDoc.save();

    // Step 4: Create booking record
    const booking = await DoctorBookingSlot.create({
      doctor,
      patient: user,
      appointmentDate,
      timeSlot,
      session,
      type,
      languagePreference
    });

    // Step 5: Create transaction
    const transaction = await Transaction.create({
      user,
      psychologist: doctor,
      userName: userDoc.name,
      phoneNo: userDoc.phoneNo,
      psychologistName: psychologistDoc.name,
      amount,
      type: 'debit',
      role: psychologistDoc.role,
      status: 'success',
      source: `${type}_payment`,
      message,
      paymentId,
      bookingId: booking._id
    });

    // if (psychologistDoc?.fcmToken) {
    //   await sendNotification(
    //     psychologistDoc.fcmToken,
    //     "New Appointment Request",
    //     `${userDoc.name} booked a consultation at ${booking.time}`,
    //     { screen: "APPOINTMENT_DETAILS", bookingId: booking._id.toString() }
    //   );
    // }

    // if (userDoc?.fcmToken) {
    //   await sendNotification(
    //     userDoc.fcmToken,
    //     "Booking Confirmed",
    //     `Your appointment with Dr. ${psychologistDoc.name} is confirmed.`,
    //     { screen: "BOOKING_DETAILS", bookingId: booking._id.toString() }
    //   );
    // }

    return res.status(201).json({
      message: 'Booking and transaction successful',
      booking,
      transaction,
      updatedWallet: userDoc.wallet
    });

  } catch (error) {
    console.error('Booking + Transaction error:', error);
    return res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

// GET /api/doctor-bookings/my-upcoming-doctors?limit=20&page=1&status=booked
// GET /api/doctor-bookings/my-upcoming-bookings?status=booked&page=1&limit=20
doctorBookingSlotController.getMyUpcomingDoctorsSessions = async (req, res) => {
  try {
    const userId = req.user && req.user._id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(parseInt(req.query.limit, 10) || 20, 100));
    const skip = (page - 1) * limit;

    // Optional status, widen as needed (e.g., ['booked','confirmed'])
    const status = req.query.status ? String(req.query.status) : null;

    // Toggle behavior via query params
    const includeToday = req.query.includeToday !== 'false'; // default true
    const todayOnly = req.query.todayOnly === 'true';        // default false

    // Build time bounds (use UTC if appointmentDate is stored as UTC midnight)
    const now = new Date();
    const startOfToday = new Date(now);
    // If appointmentDate is stored in UTC midnight, prefer setUTCHours
    startOfToday.setUTCHours(0, 0, 0, 0);

    let dateMatch;
    if (todayOnly) {
      const endOfToday = new Date(startOfToday);
      endOfToday.setUTCDate(endOfToday.getUTCDate() + 1);
      dateMatch = { $gte: startOfToday, $lt: endOfToday };
    } else if (includeToday) {
      dateMatch = { $gte: startOfToday };
    } else {
      dateMatch = { $gte: now };
    }

    const match = {
      patient: userId,
      appointmentDate: dateMatch,
      ...(status ? { status } : {})
    };

    const pipeline = [
      { $match: match },                              // patient-scoped + future
      { $sort: { appointmentDate: 1, createdAt: 1 } },// soonest first
      {
        $lookup: {                                    // join doctor
          from: 'users',
          localField: 'doctor',
          foreignField: '_id',
          as: 'doctor'
        }
      },
      { $unwind: '$doctor' },
      {
        $lookup: { // Deep populate languages referenced by doctor.languages
          from: 'languages',         // collection name for languages (use actual)
          localField: 'doctor.languages',
          foreignField: '_id',
          as: 'doctor.languages'
        }
      },
      {
        $lookup: { // Deep populate languages referenced by doctor.languages
          from: 'categories',         // collection name for languages (use actual)
          localField: 'doctor.specialization',
          foreignField: '_id',
          as: 'doctor.specialization'
        }
      },
      {
        $project: {
          _id: 1,
          doctorId: '$doctor._id',
          name: '$doctor.name',
          userImage: '$doctor.userImage',
          gender: '$doctor.gender',
          experience: '$doctor.experience',
          chatCharge: '$doctor.chatCharge',
          callCharge: '$doctor.callCharge',
          videoCharge: '$doctor.videoCharge',
          specialization: '$doctor.specialization',
          languages: '$doctor.languages',
          averageRating: '$doctor.averageRating',
          totalReviews: '$doctor.totalReviews',
          callCharge: '$doctor.callCharge',
          chatCharge: '$doctor.chatCharge',
          videoCharge: '$doctor.videoCharge',
          appointmentDate: 1,
          timeSlot: 1,
          session: 1,
          type: 1,
          status: 1
        }
      },
      { $skip: skip },
      { $limit: limit }
    ];

    const [rows, totalCount] = await Promise.all([
      DoctorBookingSlot.aggregate(pipeline),
      DoctorBookingSlot.countDocuments(match)
    ]);

    return res.status(200).json({
      message: 'My upcoming bookings',
      data: rows,
      pagination: { page, limit, count: totalCount },
      filters: { status: status || 'all' }
    });
  } catch (err) {
    console.error('getMyUpcomingBookings error:', err);
    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
};



module.exports = {doctorBookingSlotController, doctorBookingSlotControllerForPsychologist};

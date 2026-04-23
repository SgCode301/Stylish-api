// controllers/callController.js
const Booking = require("../models/DoctorBookingSlot");
const User = require("../models/User");
const sendNotification = require("../utils/sendNotification");
const generateZegoToken = require("../utils/generateZegoToken");
const { bookSlotAndCreateTransaction, deductOneMinuteFromWallet } = require("../helper/bookTransaction");

exports.startCall = async (req, res) => {
  try {
    let { bookingId, data, callType } = req.body;
    if (!bookingId) {
      // Fetch doctor/user objects first for validation
      const userDoc = await User.findById(req.user._id);
      const psychologistDoc = await User.findById(req.body.doctor);
      const callType = req.body.type;

      if (!psychologistDoc) {
        return res.status(404).json({ error: "Psychologist not found" });
      }

      if (psychologistDoc?.status == 'offline') {
        return res.status(400).json({ error: "Psychologist is offline" });
      }

      if (psychologistDoc?.status == "busy") {
        return res.status(400).json({ error: "Psychologist is busy" });
      }

      let perMinuteRate = 0;
      if (callType === 'call') perMinuteRate = psychologistDoc?.callCharge;
      else if (callType === 'video') perMinuteRate = psychologistDoc?.videoCharge;
      else perMinuteRate = psychologistDoc?.chatCharge || 0;

      // console.log(`Per minute rate for ${callType}:`, perMinuteRate);
      // console.log(`User wallet balance:`, userDoc.wallet);

      const requiredAmount = perMinuteRate * 2;
      if (userDoc.wallet < requiredAmount) {
        return res.status(400).json({
          error: `Insufficient wallet for 2 min ${callType} call. Need ${requiredAmount}, have ${userDoc.wallet}`
        });
      }

      const result = await bookSlotAndCreateTransaction({
        userId: req.user._id,
        doctorId: req.body.doctor,
        appointmentDate: req.body.appointmentDate,
        type: req.body.type,
        timeSlot: req.body.timeSlot,
        session: req.body.session,
        amount: req.body.amount
      });
      if (!result.booking) {
        return res.status(400).json({ error: result.error || "Booking failed" });
      }
      bookingId = result.booking._id;
    }

    // Find booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Fetch participants (single User model with role)
    const user = await User.findById(booking.patient);
    const doctor = await User.findById(booking.doctor);

    if (!user || !doctor) {
      return res.status(404).json({ error: "User or Doctor not found" });
    }

    if (doctor?.status == 'offline') {
      return res.status(400).json({ error: "Psychologist is offline" });
    }

    if (doctor?.status == "busy") {
      return res.status(400).json({ error: "Psychologist is busy" });
    }

    // ✅ Generate Zego Token
    const { token: zegoToken, expireAt } = await generateZegoToken({
      userID: `booking_${bookingId}`,
      roomID: `room_${bookingId}`,
      publish: true,
      login: true
    });

    let fcmResponse = null;

    // Determine initiator
    const initiatorId = req.user._id.toString();
    const receiver =
      initiatorId === user._id.toString()
        ? doctor // if user started, notify doctor
        : user;  // if doctor started, notify user

    // ✅ Send Notification only to receiver
    data = { ...data, bookingId: bookingId.toString() }
    // if (receiver.fcmToken) {
    //   fcmResponse = await sendNotification(
    //     receiver.fcmToken,
    //     "Incoming Call",
    //     `Tap to join the consultation.`,
    //     data
    //   );
    // }
    if (receiver?.fcmToken) {
  sendNotification(
    receiver.fcmToken,
    "Incoming Call",
    "Tap to join the consultation.",
    data,
    receiver._id
  ).catch(() => {}); 
}

    return res.status(200).json({
      message: "Call initiated successfully",
      zegoToken,
      fcmResponse,
      callType,
      roomId: `room_${bookingId}`,
      bookingId,
      doctorId: doctor._id,
      callType: callType || req.body.type,
      receiver: receiver._id, // for frontend if needed
    });

  } catch (error) {
    console.error("Error starting call:", error);
    return res.status(500).json({ error: "Failed to start call" });
  }
};

exports.deductOneMinute = async (req, res) => {
  try {
    const userId = req.user && req.user._id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { doctorId, bookingId, callType } = req.body;
    if (!doctorId || !callType || !bookingId) {
      return res.status(400).json({ message: 'doctorId, bookingId and callType are required' });
    }

    const result = await deductOneMinuteFromWallet({ userId, doctorId, bookingId, type: callType });

    if (result.error) {
      return res.status(400).json({ message: result.error });
    }

    return res.status(200).json({
      message: 'Deducted 1 minute from wallet',
      updatedWallet: result.updatedWallet,
      walletStatus: result.walletStatus,
      videoCharge: result.videoCharge,
      callCharge: result.callCharge
    });
  } catch (err) {
    console.error('Error in wallet deduction:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


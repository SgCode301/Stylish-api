const User = require('../models/User');
const DoctorAvailableSlots = require('../models/DoctorAvailableSlots');
const DoctorBookingSlot = require('../models/DoctorBookingSlot');
const Transaction = require('../models/Transaction');

async function bookSlotAndCreateTransaction({
  userId,
  doctorId,
  appointmentDate,
  type,
  timeSlot,
  session,
  amount
}) {
  // Fetch user
  const userDoc = await User.findById(userId);
  if (!userDoc) throw new Error('User not found');

  // Check wallet balance
  if (userDoc.wallet < amount) return { error: 'Insufficient wallet balance' };

  // Fetch doctor
  const doctorDoc = await User.findById(doctorId);
  if (!doctorDoc) throw new Error('Doctor not found');

  // Find or create availability
  let availability = await DoctorAvailableSlots.findOne({
    doctor: doctorId,
    date: appointmentDate,
    session
  });

  if (!availability) {
    availability = new DoctorAvailableSlots({
      doctor: doctorId,
      date: appointmentDate,
      session,
      slots: [{
        time: timeSlot,
        isBooked: true,
        bookedBy: userId
      }],
      // languageSupport: languagePreference
    });
    await availability.save();
  } else {
    let slot = availability.slots.find(s => s.time === timeSlot);
    if (slot && slot.isBooked) {
      return { error: 'Time slot already booked' };
    } else if (slot) {
      slot.isBooked = true;
      slot.bookedBy = userId;
    } else {
      availability.slots.push({ time: timeSlot, isBooked: true, bookedBy: userId });
    }
    await availability.save();
  }

  // Deduct wallet amount
  // userDoc.wallet -= amount;
  // await userDoc.save();

  // Create booking
  const booking = await DoctorBookingSlot.create({
    doctor: doctorId,
    patient: userId,
    appointmentDate,
    timeSlot,
    session,
    type
    // languagePreference
  });

  // Create transaction
  // const transaction = await Transaction.create({
  //   user: userId,
  //   psychologist: doctorId,
  //   userName: userDoc.name,
  //   phoneNo: userDoc.phoneNo,
  //   psychologistName: doctorDoc.name,
  //   amount,
  //   type: 'initiate',
  //   status: 'success',
  //   source: `${type}_payment`,
  //   message: 'Payment for booking slot',
  //   paymentId: `PAY_Wallet_${Date.now()}`,
  //   bookingId: booking._id
  // });

  return {
    booking,
    // transaction,
    updatedWallet: userDoc.wallet
  };
}

/**
 * Deducts 1 minute rate from user's wallet for provided call type.
 * Returns the updated wallet and walletStatus (false if < 10), or error.
 */
async function deductOneMinuteFromWallet({ userId, doctorId, bookingId, type }) {
  let perMinuteRate = 0;

  // Fetch user
  const userDoc = await User.findById(userId);
  if (!userDoc) throw new Error('User not found');

  // Fetch doctor
  const doctorDoc = await User.findById(doctorId);
  if (!doctorDoc) throw new Error('Doctor not found');

  const bookingDoc = await DoctorBookingSlot.findById(bookingId);
  if (!bookingDoc) throw new Error('Booking not found');

  if (type === 'call') perMinuteRate = doctorDoc.callCharge;
  else if (type === 'video') perMinuteRate = doctorDoc.videoCharge;
  else perMinuteRate = doctorDoc.chatCharge || 0; // fallback for chat

  if (userDoc.wallet < perMinuteRate) {
    return { error: 'Insufficient wallet balance for 1 min ' + type + ' call' };
  }

  let transactionDoc = await Transaction.findOne({ bookingId });
  if (!transactionDoc) {
    transactionDoc = await Transaction.create({
      user: userId,
      psychologist: doctorId,
      userName: userDoc.name,
      phoneNo: userDoc.phoneNo,
      psychologistName: doctorDoc.name,
      amount: perMinuteRate,
      type: 'debit',
      role: doctorDoc.role,
      status: 'success',
      source: `${type}_payment`,
      message: 'Payment for booking slot',
      paymentId: `PAY_Wallet_${Date.now()}`,
      bookingId: bookingDoc._id
    });
  } else {

    transactionDoc.amount += perMinuteRate;
    await transactionDoc.save();
  }

  userDoc.wallet -= perMinuteRate;
  await userDoc.save();

  bookingDoc.amount += perMinuteRate;
  await bookingDoc.save();
  let walletStatus = true;
  if (type === 'video' && userDoc.wallet < doctorDoc.videoCharge) {
    walletStatus = false;
  } else if (type === 'call' && userDoc.wallet < doctorDoc.callCharge) {
    walletStatus = false;
  } else if (type === 'chat' && userDoc.wallet < doctorDoc.chatCharge) {
    walletStatus = false;
  }

  return {
    updatedWallet: userDoc.wallet,
    walletStatus,
    videoCharge: doctorDoc.videoCharge,
    callCharge: doctorDoc.callCharge
  };
}


module.exports = { bookSlotAndCreateTransaction, deductOneMinuteFromWallet };

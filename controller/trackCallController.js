const BaseController  =  require("../core/BaseController");
const TrackCall  =  require("../models/TrackCall")
const config =  require("../config/config");
const trackCallController = new BaseController(TrackCall, {
  name: 'trackCall',
  access: 'admin',
  get: {
    pagination: config.pagination,
    query:["userId","psychologistId","status"],
    populate: [
      { path: 'userId', select: 'name email phoneNo' },
      { path: 'psychologistId', select: 'name email phoneNo' },
      { path: 'bookingId', select: 'appointmentDate timeSlot status' }
    ]
  }
});

function computeDurationSeconds(doc) {
  if (doc.startTime && doc.endTime) {
    const ms = new Date(doc.endTime).getTime() - new Date(doc.startTime).getTime();
    return Math.max(0, Math.floor(ms / 1000));
  }
  return 0;
}

trackCallController.createTrackCall = async (req, res) =>{
  try {
    const {
      psychologistId,
      bookingId,
      callType,          // 'video' | 'audio' (optional)
      externalCallId,    // optional
    } = req.body || {};

    // Require authenticated user
    const userId = req.user && req.user._id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: user id required' });
    }

    // Optional: validate related entities (uncomment if needed)
    // const booking = await Booking.findById(bookingId);
    // if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Build payload
    const payload = {
      userId,
      psychologistId,
      bookingId,
      callType: callType || 'video',
      status: 'initiated',
      startTime: new Date(),
    };

    const doc = new TrackCall(payload);
    await doc.save(); // schema hooks handle durationSeconds if endTime present

    return res.status(201).json({
      message: 'Call created successfully',
      data: doc,
    });
  } catch (error) {
    console.error('createTrackCall error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

// Update only the status (and optional endTime/notes/reason) of a TrackCall
// Route: PATCH /api/track-calls/:id/status
// Body:
// {
//   "status": "initiated" | "ringing" | "connected" | "ended" | "missed" | "failed" | "canceled",
//   "endTime": "2025-08-24T14:05:30.000Z",   // optional; when ending, provide to compute duration
//   "notes": "optional text",                // optional
//   "reason": "optional text"                // optional
// }
trackCallController.updateTrackCallStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, reason } = req.body || {};

    if (!id) {
      return res.status(400).json({ message: 'TrackCall id is required in URL params' });
    }
    if (!status) {
      return res.status(400).json({ message: 'status is required' });
    }

    // Optionally, enforce auth
    // const userId = req.user && req.user._id;
    // if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    let trackCallData = await TrackCall.findById(id);
    if (!trackCallData) {
      return res.status(404).json({ message: 'TrackCall not found' });
    }

    let endTime = new Date();

    const duration = (trackCallData.startTime && trackCallData.endTime) ? computeDurationSeconds(trackCallData) : 0;

    // Build the minimal update object
    const updatePayload = { status };
    updatePayload.endTime = endTime;
    updatePayload.durationSeconds = duration;
    if (notes !== undefined) updatePayload.notes = notes;
    if (reason !== undefined) updatePayload.reason = reason;

    // Let your TrackCall schema pre('findOneAndUpdate') hook recalc duration when endTime changes
    const updated = await TrackCall.findOneAndUpdate(
      { _id: id },
      updatePayload,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'TrackCall not found' });
    }

    return res.status(200).json({
      message: 'TrackCall status updated',
      data: updated,
    });
  } catch (error) {
    console.error('updateTrackCallStatus error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

module.exports = trackCallController;
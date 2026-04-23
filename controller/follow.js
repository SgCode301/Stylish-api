const BaseController  =  require("../core/BaseController");
const Follow  =  require("../models/Follow");
const config =  require("../config/config");
const User = require("../models/User");
const mongoose = require("mongoose");


const userFollowController = new BaseController(Follow, {
  name: 'Follow',
  access:'user',
  accessKey:'user',
  get: {
    pagination: config.pagination,
    query: ["doctor", "user"],
    populate: [
      { path: 'doctor', select: 'name email phoneNo role gender dob averageRating totalReviews userImage wallet commissionPercentage address bio specialization education experience wallet chatCharge languages callCharge  videoCharge  chatTime callTime status isVerified isApproved isProfileCompleted isBlocked' }
      // { path: 'user', select: 'name email phoneNo ' }
    ]
  },
});


const  psychologistFollowController    =  new  BaseController(Follow ,{
  name:'Follow',
  access:'user',
  accessKey:'doctor',
  get: {
    pagination: config.pagination,
    populate: [
      { path: 'doctor', select: 'name email phoneNo' },
      { path: 'user', select: 'name email phoneNo ' }
    ]
  },
  

});


userFollowController.toggleFollow = async (req, res) => {
  try {
    const userId = req.user._id;
    const { doctorId } = req.body || {};

    if (!doctorId || !mongoose.isObjectIdOrHexString(doctorId)) {
      return res.status(400).json({ message: 'doctorId is required' });
    }
    if (String(userId) === String(doctorId)) {
      return res.status(400).json({ message: 'Cannot follow self' });
    }

    const filter = { user: userId, doctor: doctorId };

    // First try to unfollow (idempotent delete)
    const removed = await Follow.findOneAndDelete(filter).lean();
    if (removed) {
      return res.status(200).json({ followed: false, message: 'Unfollowed successfully' });
    }

    // Otherwise follow (create); unique index prevents duplicates
    try {
      const created = await Follow.create(filter);
      return res.status(201).json({
        followed: true,
        id: created._id,
        message: 'Followed successfully'
      });
    } catch (e) {
      // Duplicate key: someone followed concurrently (unique index did its job)
      if (e && e.code === 11000) {
        return res.status(200).json({ followed: true, message: 'Already followed' });
      }
      throw e;
    }
  } catch (err) {
    console.error('toggle follow error:', err);
    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
};


module.exports = {userFollowController, psychologistFollowController }
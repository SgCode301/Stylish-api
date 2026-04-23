const BaseController  =  require("../core/BaseController");
const Review  =  require("../models/Review");
const config =  require("../config/config");
const { populate } = require("../models/Service");
const User = require("../models/User");


const userReviewController = new BaseController(Review, {
  name: 'review',
  // access:'user',
  // accessKey:'user',
  get: {
    pagination: config.pagination,
    query: ["doctor", "user"],
    populate: [
      { path: 'doctor', select: 'name email phoneNo userImage' },
      { path: 'user', select: 'name email phoneNo userImage' }
    ]
  },
});

const publicReviewController = new BaseController(Review, {
  name: 'review',
  // access:'user',
  // accessKey:'user',
  get: {
    pagination: config.pagination,
    query: ["doctor", "user"],
    populate: [
      { path: 'doctor', select: 'name email phoneNo userImage' },
      { path: 'user', select: 'name email phoneNo userImage' }
    ]
  },
});

const adminReviewController = new BaseController(Review, {
  name: 'review',
  // access:'user',
  // accessKey:'user',
  get: {
    pagination: config.pagination,
    query: ["doctor", "user"],
    populate: [
      { path: 'doctor', select: 'name email phoneNo userImage' },
      { path: 'user', select: 'name email phoneNo userImage' }
    ],
    searchFields: ['star','user','doctor']
  },
});


const  psychologistreviewController    =  new  BaseController(Review ,{
  name:'review',
  access:'user',
  accessKey:'doctor',
  get: {
    pagination: config.pagination,
    populate: [
      { path: 'doctor', select: 'name email phoneNo userImage' },
      { path: 'user', select: 'name email phoneNo userImage' }
    ]
  },
  

});

// ⭐ Add custom method
userReviewController.addRatingReview = async (req, res) => {
  try {
    const { doctorId, star, message } = req.body;
    let userId = req.user._id;

    if (!doctorId || !userId || !star) {
      return res.status(400).json({ error: 'doctorId, userId, and star are required' });
    }

    // 1. Check if user already reviewed this doctor
    const existingReview = await Review.findOne({ doctor: doctorId, user: userId });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already given a review to this doctor.' });
    }

    // 2. Create new review
    const newReview = await Review.create({
      doctor: doctorId,
      user: userId,
      star,
      message
    });

    // 3. Update doctor's averageRating and totalReviews
    const reviews = await Review.find({ doctor: doctorId });

    const totalReviews = reviews.length;
    const averageRating = reviews.reduce((acc, cur) => acc + cur.star, 0) / totalReviews;

    await User.findByIdAndUpdate(doctorId, {
      averageRating: averageRating.toFixed(1),
      totalReviews: totalReviews
    });

    res.status(201).json({
      message: 'Review added successfully',
      data: newReview
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong while adding review' });
  }
};
 
module.exports = {userReviewController, publicReviewController, psychologistreviewController, adminReviewController }
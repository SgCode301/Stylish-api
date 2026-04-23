const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema(
  {
    couponCode: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    discountPercentage: {
      type: Number,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true // true = "On", false = "Off"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Coupon', CouponSchema);

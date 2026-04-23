const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // otp: { type: Number, default: null },
    otp: [
      {
        otp: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    role: {
      type: String,
      enum: ["user", "admin", "psychologist", "counsellor"],
      default: "user",
    },
    isBlocked: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    userImage: { type: String, default: null },
    phoneNo: { type: String, unique: true,index:true },
    name: { type: String },
    email: { type: String },
    password: { type: String },
    pincode: { type: String },
    address: { type: String },
    city: { type: String },
    upi: { type: String, default: null },
    skill: { type: String, default: null },
    state: { type: String },
    token: { type: String, default: null },
    wallet: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    commissionPercentage: { type: Number, default: 50 },
    referCode: { type: String },
    referBy: { type: String },
    aboutus: { type: String },
    isVerified: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    isProfileCompleted: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["offline", "online", "busy"],
      default: "offline",
    },
    specialization: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    }
   ],
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      // default: "male",
    },
    dob: { type: String },
    bio: { type: String },
    languages: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Language",
    }
   ],
   type: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Type",
    }
   ],
    identity: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Identity",
    }
   ],
    concern: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Concern",
    }
   ],
    education: { type: String },
    experience: { type: String },
    callCharge: { type: Number },
    videoCharge: { type: Number },
    chatTime: { type: String },
    callTime: { type: String },
    fcmToken: { type: String },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    documents: [
      {
        url: { type: String, required: true },
        name: { type: String },
      },
    ],
    availability: [
      {
        day: {
          type: String,
          enum: [
            "sunday",
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
          ],
        },
        startTime: { type: String },
        endTime: { type: String },
      },
    ],
  },
  {
    timestamps: true,
  }
);
userSchema.pre("save", function (next) {
  if (this.isModified("phoneNo") && this.phoneNo) {
    let phone = this.phoneNo.toString().trim();

    if (phone.startsWith("+")) {
      phone = phone.substring(1);
    }

    if (!phone.startsWith("91")) {
      phone = "91" + phone;
    }

    this.phoneNo = phone;
  }
  next();
});
userSchema.index({ name: 'text', email: 'text' });

module.exports = mongoose.model("User", userSchema);

const  User  =  require("../models/User");
const config =  require("../config/config");
const BaseController  =  require("../core/BaseController");
const SettlementTransaction = require("../models/SettlementTransaction");

const userController = new BaseController(User, {
  name: 'user',
  access:'user',
  accessKey:'_id',
  get: {
     pagination: config.pagination,
     select:"name email phoneNo role gender upi skill dob availability averageRating totalReviews userImage wallet commissionPercentage address bio specialization education experience wallet chatCharge languages callCharge  videoCharge  chatTime callTime status isVerified isApproved isProfileCompleted isBlocked",
     query: ["email", "phoneNo", "role", "status", "gender", "experience", "languages"],
     populate: [
        { path: 'type', select: 'title' },
        { path: 'languages', select: 'title' },
        { path: 'specialization', select: 'title' },
        { path: 'identity', select: 'title' },
        { path: 'concern', select: 'title' },
        { path: 'experience', select: 'title' }
      ],
     
  },
  getById: {
        select:"name email phoneNo role gender upi skill dob availability averageRating totalReviews userImage wallet commissionPercentage address bio specialization education experience wallet chatCharge languages callCharge  videoCharge  chatTime callTime status isVerified isApproved isProfileCompleted isBlocked",
        populate: [
        { path: 'type', select: 'title' },
        { path: 'languages', select: 'title' },
        { path: 'specialization', select: 'title' },
        { path: 'identity', select: 'title' },
        { path: 'concern', select: 'title' },
        { path: 'experience', select: 'title' }
      ],
   },
  
});

const userPublicController = new BaseController(User, {
  name: 'user',
//   access:'user',
//   accessKey:'_id',
  get: {
     pagination: config.pagination,
     select:"name email phoneNo skill upi status role gender dob specialization type identity concern averageRating totalReviews userImage wallet commissionPercentage address bio specialization education experience wallet chatCharge languages callCharge  videoCharge  chatTime callTime status isVerified isApproved isProfileCompleted isBlocked",
     query: ["email", "phoneNo", "role", "status", "gender", "specialization", "experience", "languages", "type", "concern", "identity", "isApproved", "isVerified"],
    populate: [
        { path: 'type', select: 'title' },
        { path: 'languages', select: 'title' },
        { path: 'specialization', select: 'title' },
        { path: 'identity', select: 'title' },
        { path: 'concern', select: 'title' },
        { path: 'experience', select: 'title' }
      ],
     searchFields: ['name'],
     pre: async (filter, req) => {
      if(!req.query.role){
        filter.role = {
          $nin: ['admin','user'] 
        }
      }
     }
  },
  getById: {
        select:"name email phoneNo role gender skill upi dob averageRating totalReviews userImage wallet commissionPercentage address bio specialization education experience wallet chatCharge languages availability callCharge  videoCharge  chatTime callTime status isVerified isApproved isProfileCompleted isBlocked",
        populate: [
        { path: 'type', select: 'title' },
        { path: 'languages', select: 'title' },
        { path: 'specialization', select: 'title' },
        { path: 'identity', select: 'title' },
        { path: 'concern', select: 'title' },
        { path: 'experience', select: 'title' }
      ],
   },
  
});



const userControllerAdmin = new BaseController(User, {
  name: 'user',
  access: 'admin',
  get: {
     pagination: config.pagination,
     select: "name email phoneNo role upi gender dob averageRating totalReviews userImage wallet commissionPercentage address bio specialization education experience wallet chatCharge availability languages callCharge  videoCharge  chatTime callTime status isVerified isApproved isProfileCompleted isBlocked",
     query: ["email" , "phoneNo", "role", "isApproved", "isVerified", "isBlocked"],
     populate: [
        { path: 'type', select: 'title' },
        { path: 'languages', select: 'title' },
        { path: 'specialization', select: 'title' },
        { path: 'identity', select: 'title' },
        { path: 'concern', select: 'title' },
        { path: 'experience', select: 'title' }
      ],
      searchFields: ['name','email','phoneNo']
     
  },
  getById: {
        select: "name email upi phoneNo role gender dob averageRating totalReviews userImage wallet commissionPercentage address city state pincode aboutus documents bio availability specialization education experience wallet chatCharge languages callCharge  videoCharge  chatTime callTime status isVerified isApproved isProfileCompleted isBlocked",
        populate: [
        { path: 'type', select: 'title' },
        { path: 'languages', select: 'title' },
        { path: 'specialization', select: 'title' },
        { path: 'identity', select: 'title' },
        { path: 'concern', select: 'title' },
        { path: 'experience', select: 'title' }
      ],
   },
  
});

// // Dashboard stats: total users, total courses, live courses, total purchases
// userControllerAdmin.getDashboardStats = async (req, res) => {
//   try {
//     const User = require('../models/User');
//     const Transaction = require('../models/Transaction');
//     const Booking = require('../models/DoctorBookingSlot'); 

//     // Basic counts
//     // const totalUsers = await User.countDocuments({ role: 'user' });
//     const totalUsers = await User.countDocuments({ role: 'user',isProfileCompleted:"true" });
//     const totalPsychologists = await User.countDocuments({ role: 'psychologist',isApproved:true,isProfileCompleted:true });
//     const newJoinRequests = await User.countDocuments({
//       role: { $in: ['psychologist', 'counsellor'] },
//       isApproved: false
//     });


//     // Consultations
//     // const totalConsultationsCompleted = await Booking.countDocuments({ status: 'completed' });
//     // const totalConsultationsCompleted=await Transaction.countDocuments({isSettlementRequested:true})
//     // const totalConsultationsPending = await Transaction.countDocuments({isSettlementRequested:false});
//      const totalConsultationsCompleted=await Transaction.countDocuments({isSettled:true})
//     const totalConsultationsPending = await Transaction.countDocuments({isSettled:false});


//     // Earnings breakdown
//     const transactions = await SettlementTransaction.find({ isSettled: true });

//     let totalCompanyEarning = 0;
//     let totalAdminEarning = 0;
//     let totalPsychologistEarning = 0;
//     // let totalCounsellorEarning = 0;

//     // Total Counsellor Transaction Amount (from Transaction collection)
// const counsellorAmountAggregation = await Transaction.aggregate([
//   {
//     $match: {
//       role: "counsellor",
//       status: "success"
//     }
//   },
//   {
//     $group: {
//       _id: null,
//       totalAmount: { $sum: "$amount" }
//     }
//   }
// ]);

// const totalCounsellorEarning =
//   counsellorAmountAggregation.length > 0
//     ? counsellorAmountAggregation[0].totalAmount
//     : 0;

//     for (let txn of transactions) {
//       totalCompanyEarning += txn.settlementAmount;
//       totalAdminEarning += txn.adminEarning;
//       totalPsychologistEarning += txn.psychologistEarning;
//       totalCounsellorEarning += txn.counsellorEarning;
      
//     }

//     return res.status(200).json({
//       totalUsers,
//       totalPsychologists,
//       newJoinRequests,
//       totalConsultationsCompleted,
//       totalConsultationsPending,
//       totalCompanyEarning: Math.round(totalCompanyEarning),
//       totalAdminEarning: Math.round(totalAdminEarning),
//       totalPsychologistEarning: Math.round(totalPsychologistEarning),
//       totalCounsellorEarning: Math.round(totalCounsellorEarning)

//     });

//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };

userControllerAdmin.getDashboardStats = async (req, res) => {
  try {
    const User = require('../models/User');
    const Transaction = require('../models/Transaction');
    const SettlementTransaction = require('../models/SettlementTransaction');
    const Booking = require('../models/DoctorBookingSlot'); 

  
    const totalUsers = await User.countDocuments({
      role: 'user',
      isProfileCompleted: true
    });

    const totalPsychologists = await User.countDocuments({
      role: 'psychologist',
      isApproved: true,
      isProfileCompleted: true
    });

    
    const newJoinRequests = await User.countDocuments({
      role: { $in: ['psychologist', 'counsellor',] },
      isApproved: false,
        isProfileCompleted: true
    });

    const totalConsultationsCompleted = await Transaction.countDocuments({
      isSettled: true
    });

    const totalConsultationsPending = await Transaction.countDocuments({
      isSettled: false
    });

    const settlements = await SettlementTransaction.find({ isSettled: true });

    let totalCompanyEarning = 0;
    let totalAdminEarning = 0;
    let totalPsychologistEarning = 0;

    for (let txn of settlements) {
      totalCompanyEarning += txn.settlementAmount || 0;
      totalAdminEarning += txn.adminEarning || 0;
      totalPsychologistEarning += txn.psychologistEarning || 0;
    }

    const counsellorAmountAggregation = await Transaction.aggregate([
      {
        $match: {
          role: "counsellor",
          status: "success"
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" }
        }
      }
    ]);

    const totalCounsellorEarning =
      counsellorAmountAggregation.length > 0
        ? counsellorAmountAggregation[0].totalAmount
        : 0;
 totalCompanyEarning += totalCounsellorEarning;
    return res.status(200).json({
      totalUsers,
      totalPsychologists,
      newJoinRequests,
      totalConsultationsCompleted,
      totalConsultationsPending,
      totalCompanyEarning: Math.round(totalCompanyEarning),
      totalAdminEarning: Math.round(totalAdminEarning),
      totalPsychologistEarning: Math.round(totalPsychologistEarning),
      totalCounsellorEarning: Math.round(totalCounsellorEarning)
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


userController.deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id; 

    const user = await User.findByIdAndUpdate(
      userId,
      {
        isDeleted: true,
        token: null 
      },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({
      message: "Your account has been deleted successfully",user
    });
  } catch (error) {
  console.error("DELETE ACCOUNT ERROR:", error);
  return res.status(500).json({ 
    message: "Internal server error",
    error: error.message
  });
}
};


module.exports = {userController,userPublicController,userControllerAdmin}
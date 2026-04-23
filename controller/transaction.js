const Transaction   =  require("../models/Transaction");
const User = require('../models/User');
const SettlementTransaction = require('../models/SettlementTransaction');

const BaseController  =  require("../core/BaseController");
const config =  require("../config/config");
/**
 * Transaction Controller
 * Handles creation and management of transactions
 * 
 * @module controllers/transactionController
 */
const transactionController = new BaseController(Transaction , {
  name: 'transaction',
  access: 'user',
  accessKey: 'user',
  get: {
    pagination: config.pagination,
    query:["user","psychologist","type","isSettled","initiatedBy","source","status","role"],
     populate: [
      { path: 'psychologist', select: 'name email phoneNo gender dob averageRating totalReviews userImage languages address bio specialization education experience chatCharge callCharge  videoCharge  chatTime callTime' },
      { path: 'user', select: 'name email phoneNo ' }
    ]
  },
});

const transactionPsychologistController = new BaseController(Transaction , {
  name: 'transaction',
  access: 'user',
  accessKey: 'psychologist',
  get: {
    pagination: config.pagination,
    query:["user","psychologist","type","isSettled","initiatedBy","source","status","role"],
     populate: [
      { path: 'psychologist', select: 'name email phoneNo gender dob averageRating totalReviews userImage languages address bio specialization education experience chatCharge callCharge  videoCharge  chatTime callTime' },
      { path: 'user', select: 'name email phoneNo ' }
    ]
  },
});

const transactionAdminController = new BaseController(Transaction , {
  name: 'transaction',
  access: 'admin',
  accessKey: 'user',
  get: {
    pagination: config.pagination,
    query:["user","psychologist","type","isSettled","initiatedBy","source","status","role"],
     populate: [
      { path: 'psychologist', select: 'name email phoneNo' },
      { path: 'user', select: 'name email phoneNo ' },
      { path: 'bookingId' }
    ],
    pre: async (filter, req) => {
      if (req.query.startDate || req.query.endDate) {
        filter.createdAt = {};
        if (req.query.startDate) {
          filter.createdAt.$gte = new Date(req.query.startDate);
        }
        if (req.query.endDate) {
          // You may want endDate to be inclusive of the whole day:
          const end = new Date(req.query.endDate);
          end.setHours(23, 59, 59, 999);
          filter.createdAt.$lte = end;
        }
      }
    }
  },
});

transactionPsychologistController.getTotalSettlementAmount = async (req, res) => {
  try {
    const psychologistId = req.user && req.user._id;
    if (!psychologistId) {
      return res.status(400).json({ message: "psychologistId is required" });
    }

    const filter = {
      psychologist: psychologistId,
      status: "success",
      isSettlementRequested: { $ne: true }
    };

    // Aggregate total amount of those transactions
    const aggregationResult = await Transaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" }
        }
      }
    ]);

    const totalAmount = aggregationResult.length > 0 ? aggregationResult[0].totalAmount : 0;

    return res.status(200).json({
      message: "Total amount to be settled",
      psychologistId,
      totalAmount
    });
  } catch (error) {
    console.error("Error fetching total settlement amount:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


transactionPsychologistController.requestSettlementForPsychologist = async (req, res) => {
  try {
    const psychologistId = req.user && req.user._id;
    if (!psychologistId) {
      return res.status(400).json({ message: "psychologistId is required" });
    }

    const psychologistData = await User.findById(psychologistId);
    if (!psychologistData) {
      return res.status(404).json({ message: "Psychologist not found" });
    }

    const filter = {
      psychologist: psychologistId,
      status: "success",
      isSettlementRequested: { $ne: true }
    };

    // Aggregate total amount of those transactions
    const aggregationResult = await Transaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" }
        }
      }
    ]);

    const totalAmount = aggregationResult.length > 0 ? aggregationResult[0].totalAmount : 0;
    // console.log("Total amount for settlement:", totalAmount);

    if (totalAmount <= 0) {
      return res.status(400).json({ message: "No amount available for settlement" });
    }

    const settlementTransactionData = await SettlementTransaction.create({
      psychologist: psychologistId,
      settlementAmount: totalAmount,
      role: psychologistData.role,
      isSettled: false
    });

    // Update all successful transactions of the psychologist
    const result = await Transaction.updateMany(
      { psychologist: psychologistId, status: "success", isSettlementRequested: { $ne: true } },
      { $set: { isSettlementRequested: true } }
    );
    

    return res.status(200).json({
      message: "Settlement request updated for psychologist's successful transactions",
      psychologistId,
      matchedCount: result.matchedCount || result.n,
      modifiedCount: result.modifiedCount || result.nModified
    });
  } catch (error) {
    console.error("Error updating settlement request:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


transactionController.createTransaction = async (req, res) => {
  try {
    const {
      psychologist,
      type,
      bookingId = null, // Optional booking ID
      status = 'success',
      source,
      message,
      paymentId
    } = req.body;

    let amount = parseInt(req.body.amount, 10);

    const user = req.user && req.user._id;
    if (!user) return res.status(401).json({ message: 'Unauthorized: user id required' });

    if (!user || !amount || !type || !source) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Fetch user
    const userDoc = await User.findById(user);
    if (!userDoc) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update wallet based on type
    if (status === 'success') {
      if (type === 'credit') {
        userDoc.wallet += amount;
      } else if (type === 'debit') {
        if (userDoc.wallet < amount) {
          return res.status(400).json({ message: 'Insufficient wallet balance' });
        }
        userDoc.wallet -= amount;
      }
      await userDoc.save();
    }

    let psychologistEarning = 0;
    let adminEarning = 0;

    const doctor = await User.findById(psychologist);
    if(doctor){
        const commission = doctor?.commissionPercentage || 0;

        psychologistEarning = (amount * commission) / 100;
        adminEarning = amount - psychologistEarning;
    }
        

    // Create transaction
    const transaction = new Transaction({
      user,
      userName: userDoc.name,
      phoneNo: userDoc.phoneNo,
      psychologist,
      bookingId,
      amount,
      type,
      status,
      source,
      message,
      paymentId,
      adminEarning,
      psychologistEarning
    });

    await transaction.save();

    return res.status(201).json({
      message: 'Transaction created successfully',
      transaction,
      updatedWallet: userDoc.wallet
    });

  } catch (error) {
    console.error('Transaction creation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports =  {transactionController, transactionPsychologistController, transactionAdminController};
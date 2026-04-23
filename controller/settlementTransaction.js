const BaseController  =  require("../core/BaseController");
const SettlementTransaction  = require("../models/SettlementTransaction")
const config =  require("../config/config");


const SettlementTransactionController = new BaseController(SettlementTransaction, {
  name: 'SettlementTransaction',
  access: 'admin',
  accessKey:'admin',
  get: {
    pagination: config.pagination,
     query:["psychologist","isSettled","status","role"],
     populate: [
      { path: 'psychologist', select: 'name email phoneNo gender dob averageRating totalReviews userImage languages address bio specialization education experience chatCharge callCharge  videoCharge  chatTime callTime' }
    ]
     
  },
});

module.exports = SettlementTransactionController;    
const BaseController  =  require("../core/BaseController");
const Inquiry  = require("../models/Inquiry")
const config =  require("../config/config");


const inquiryController = new BaseController(Inquiry, {
  name: 'inquiry',
  access: 'admin',
  accessKey:'admin',
  get: {
    pagination: config.pagination,
     query: ["title"],
     
  },
});

const inquiryPublicController = new BaseController(Inquiry, {
  name: 'inquiry',
  get: {
    pagination: config.pagination,
     query: ["title"],
     
  },
});

inquiryController.syncIndexes = async (req, res) => {
    try {
    // This will synchronize indexes defined in your schema with MongoDB
    const Transaction   =  require("../models/Transaction");
    const result = await Transaction.syncIndexes();
    res.json({
      message: 'Transaction indexes synced successfully!',
      details: result
    });
  } catch (err) {
    res.status(500).json({
      error: 'Index sync failed',
      details: err.toString()
    });
  }
};

module.exports = {inquiryController, inquiryPublicController};    
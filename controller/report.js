const BaseController  =  require("../core/BaseController");
const Report  = require("../models/Report")
const config =  require("../config/config");


const reportController = new BaseController(Report, {
  name: 'report',
  access: 'admin',
  accessKey:'admin',
  get: {
    pagination: config.pagination,
     searchFields: ['name','email','phone'],
      populate: [
      { path: 'createdBy', select: 'name email phoneNo ' }
    ],
  },
  getById:{
    populate: [{ path: 'createdBy', select: 'name email phoneNo ' }],
  },
  create: {
    pre: async (payload, req, res) => {
      // Ensure JSON body is present and content exists
      if (!req.user || !req.user._id) {
        return res.status(401).json({ message: 'Unauthorized: Missing user info' });
      }
      // Attach userId and return mutated payload
      payload.createdBy = req.user._id;
      return payload;
    },
  },
});


module.exports = reportController;    

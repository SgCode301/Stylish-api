const BaseController  =  require("../core/BaseController");
const CeoFeedback  = require("../models/CeoFeedback")
const config =  require("../config/config");


const ceoFeedbackController = new BaseController(CeoFeedback, {
  name: 'ceoFeedback',
  access: 'admin',
  accessKey:'admin',
  get: {
    pagination: config.pagination,
     populate: [
      { path: 'userId', select: 'name email phoneNo userImage' }
    ]
  },
  create: {
    pre: async (payload, req, res) => {
      // Ensure JSON body is present and content exists
      if (!req.user || !req.user._id) {
        return res.status(401).json({ message: 'Unauthorized: Missing user info' });
      }
      if (!payload || !payload.content || !payload.content.trim()) {
        return res.status(400).json({ message: 'content is required' });
      }

      // Attach userId and return mutated payload
      payload.userId = req.user._id;
      return payload;
    },
  },
});

module.exports = ceoFeedbackController;    
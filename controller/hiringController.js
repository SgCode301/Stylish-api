const BaseController  =  require("../core/BaseController");
const Hiring  = require("../models/Hiring")
const config =  require("../config/config");


const HiringController = new BaseController(Hiring, {
  name: 'Hiring',
  // access: 'admin',
  // accessKey:'admin',
  get: {
    pagination: config.pagination,
     query: ["title"],
     searchFields: ['name','email','phone']
  },
});

module.exports = HiringController;    
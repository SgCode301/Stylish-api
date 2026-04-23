const BaseController  =  require("../core/BaseController");
const Concern  = require("../models/Concern")
const config =  require("../config/config");


const ConcernController = new BaseController(Concern, {
  name: 'Concern',
  // access: 'admin',
  // accessKey:'admin',
  get: {
    pagination: config.pagination,
     query: ["title"],
     
  },
});

module.exports = ConcernController;    
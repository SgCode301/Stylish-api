const BaseController  =  require("../core/BaseController");
const Type  = require("../models/Type")
const config =  require("../config/config");


const TypeController = new BaseController(Type, {
  name: 'Type',
  // access: 'admin',
  // accessKey:'admin',
  get: {
    pagination: config.pagination,
     query: ["title"],
     
  },
});

module.exports = TypeController;    
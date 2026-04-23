const BaseController  =  require("../core/BaseController");
const Identity  = require("../models/Identity")
const config =  require("../config/config");


const IdentityController = new BaseController(Identity, {
  name: 'Identity',
  // access: 'admin',
  // accessKey:'admin',
  get: {
    pagination: config.pagination,
     query: ["title"],
     
  },
});

module.exports = IdentityController;    
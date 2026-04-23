const BaseController  =  require("../core/BaseController");
const Language  = require("../models/Language")
const config =  require("../config/config");


const languageController = new BaseController(Language, {
  name: 'Language',
  // access: 'admin',
  // accessKey:'admin',
  get: {
    pagination: config.pagination,
     query: ["title"],
     
  },
});


module.exports = languageController;    
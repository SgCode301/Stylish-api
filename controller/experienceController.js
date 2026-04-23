const BaseController  =  require("../core/BaseController");
const Experience  = require("../models/Experience")
const config =  require("../config/config");


const experienceController = new BaseController(Experience, {
  name: 'Experience',
  // access: 'admin',
  // accessKey:'admin',
  get: {
    pagination: config.pagination,
     query: ["title"],
     
  },
});

module.exports = experienceController;    
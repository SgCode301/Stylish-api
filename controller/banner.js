const BaseController  =  require("../core/BaseController");
const Banner  = require("../models/Banner")
const config =  require("../config/config");


const bannerController = new BaseController(Banner, {
  name: 'banner',
  access: 'admin',
  accessKey:'admin',
  get: {
    pagination: config.pagination,
     query: ["title"],
     
  },
});

module.exports = bannerController;    
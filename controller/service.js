
const BaseController  =  require("../core/BaseController");
const Service  =  require("../models/Service");
const config =  require("../config/config");
const serviceController = new BaseController(Service, {
  name: 'service',
  access: 'user',
  get: {
    pagination: config.pagination,
  },
});

module.exports =  serviceController;
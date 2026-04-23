const BaseController  =  require("../core/BaseController");
const Coupon  = require("../models/Coupon")
const config =  require("../config/config");


const couponController = new BaseController(Coupon, {
  name: 'coupon',
  access: 'admin',
  accessKey:'admin',
  get: {
    pagination: config.pagination
  },
});

module.exports = couponController;    
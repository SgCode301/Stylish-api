const BaseController  =  require("../core/BaseController");
const Category  =  require("../models/Category");
const config =  require("../config/config");


const categoryController = new BaseController(Category, {
  name: 'category',
  access: 'Admin',
  get: {
    pagination: config.pagination,
     query: ["title"],
     
  },
  getById: {
        select: "title  description  image ",
   },
  
});

module.exports = categoryController;    
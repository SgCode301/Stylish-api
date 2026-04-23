const BaseController  =  require("../core/BaseController");
const Blog  =  require("../models/Blog")
const config =  require("../config/config");
const appintmentController = new BaseController(Blog, {
  name: 'blog',
  access: 'admin',
  get: {
    pagination: config.pagination,
    populate: [
      { path: 'author', select: 'name' },
      { path: 'category', select: 'title' }
    ]
  },
});

module.exports = appintmentController;
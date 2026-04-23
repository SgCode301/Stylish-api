const  express =  require("express");

const  router   =   express.Router();

const ImageModel = require('../models/Image');
const ImageCloudinaryController = require('../core/ImageCloudinaryController');
const { authController } = require("../controller/auth");
const config = require('../config/config');


const imageUploadController = new ImageCloudinaryController(ImageModel, {
  cloudinary: {
    cloudName: config.cloudinary.cloudName, // Ensure these environment variables are set
    apiKey: config.cloudinary.apiKey,
    apiSecret: config.cloudinary.apiSecret
  },
  quality: {
    cloudinaryQuality: 'auto' // Let Cloudinary optimize further
  },
  rootAccessRoles: ['admin'], // Optional
  pagination: {
    limit: 10,
    maxLimit: 50
  }
});



router.post('/', imageUploadController.uploadImagePublic);
router.delete('/:id', imageUploadController.deleteFromCloudinary);
router.get('/', imageUploadController.getImages);


module.exports =  router ;


const express = require('express');
const router = express.Router();
const categoryController = require('../controller/category');
const blogController = require('../controller/blog');
const bannerController = require('../controller/banner');
const {publicReviewController} = require('../controller/review');
const { userPublicController } = require('../controller/user');
const { doctorAvailableSlotsPublicController } = require('../controller/DoctorAvailableSlotsController');
const { inquiryPublicController } = require('../controller/inquiry');
const languageController = require('../controller/languageController');
const IdentityController = require('../controller/identityController');
const experienceController = require('../controller/experienceController');
const TypeController = require('../controller/typeController');
const ConcernController = require('../controller/concernController');
const hiringController = require('../controller/hiringController');

// Public routes for the application

// Blog CRUD
router.get('/blog', blogController.get);
router.get('/blog/:id', blogController.getById);

// Category CRUD
router.get('/category', categoryController.get); // add pagination
router.get('/category/:id', categoryController.getById);

router.post("/hiring"  ,  hiringController.create);


// // Banner CRUD
router.get('/banner', bannerController.get); // add pagination
router.get('/banner/:id', bannerController.getById);

router.get("/language" ,  languageController.get);
router.get("/language/:id" , languageController.getById);

router.get("/identity" ,  IdentityController.get);
router.get("/identity/:id" , IdentityController.getById);

router.get("/experience" ,  experienceController.get);
router.get("/experience/:id" , experienceController.getById);

router.get("/concern" ,  ConcernController.get);
router.get("/concern/:id" , ConcernController.getById);

router.get("/type" ,  TypeController.get);
router.get("/type/:id" , TypeController.getById);

// // review CRUD
router.get('/review', publicReviewController.get); // add pagination
router.get('/review/:id', publicReviewController.getById);

// User CRUD
router.get("/user" ,  userPublicController.get);
router.get("/user/:id" , userPublicController.getById);

// Slot CRUD
router.get('/doctorSlot', doctorAvailableSlotsPublicController.get);
router.get('/doctorSlot/:id', doctorAvailableSlotsPublicController.getById);

router.post("/inquiry" , inquiryPublicController.create);


module.exports = router;
const  express =  require("express");

const  router   =   express.Router();


const categoryController =  require("../controller/category");
const blogController =  require("../controller/blog");
const bannerController =  require("../controller/banner");
const couponController =  require("../controller/coupon")
const  {userControllerAdmin, userController } =  require("../controller/user");
const { authController } = require("../controller/auth");
const {transactionAdminController} = require("../controller/transaction");
const { adminReviewController } = require("../controller/review");
const { inquiryController } = require("../controller/inquiry");
const {doctorBookingSlotController} = require("../controller/DoctorBookingSlotController");
const ceoFeedbackController = require("../controller/ceoFeedbackController");
const notificationController = require("../controller/notification");
const reportController = require("../controller/report");
const typeController = require("../controller/typeController");
const concernController = require("../controller/concernController");
const hiringController = require("../controller/hiringController");
const IdentityController = require("../controller/identityController");
const languageController = require("../controller/languageController");
const experienceController = require("../controller/experienceController");
const SettlementTransactionController = require("../controller/settlementTransaction");
const { adminReportPsychologistController } = require("../controller/reportPsychologist");


// Protect all routes below this line
router.use(authController.authenticateToken);   
router.use(authController.authorizeRole('admin')); 

//
router.get("/profile", userController.get);
router.patch("/profile",authController.updateUser);

router.post("/category" , categoryController.create);
router.patch("/category/:id",categoryController.updateById);
router.get("/category" , categoryController.get);
router.get("/category/:id",categoryController.getById);
router.delete("/category/:id" , categoryController.deleteById);

router.get("/ceoFeedback", ceoFeedbackController.get);

router.post("/blog" , blogController.create);
router.patch("/blog/:id",blogController.updateById);
router.get("/blog" , blogController.get);
router.get("/blog/:id",blogController.getById);
router.delete("/blog/:id" , blogController.deleteById);



//create user complete crud 
router.post("/user"  ,  userControllerAdmin.create );
router.get("/user" ,  userControllerAdmin.get);
router.get("/user/:id" , userControllerAdmin.getById);
router.patch("/user/:id" , userControllerAdmin.updateById);
router.delete("/user/:id", userControllerAdmin.deleteById);


router.post("/banner"  ,  bannerController.create);
router.patch("/banner/:id" ,  bannerController.updateById);
router.get("/banner" ,  bannerController.get);
router.get("/banner/:id" , bannerController.getById);
router.delete("/banner/:id" ,  bannerController.deleteById);

router.patch("/report/:id" ,  reportController.updateById);
router.get("/report" ,  reportController.get);
router.get("/report/:id" , reportController.getById);
router.delete("/report/:id" ,  reportController.deleteById);

router.post("/notification"  ,  notificationController.create);
router.put("/notification/:id" ,  notificationController.updateById);
router.get("/notification" ,  notificationController.get);
router.get("/notification/inbox" ,  notificationController.getInbox);
router.get("/notification/:id" , notificationController.getById);
router.delete("/notification/:id" ,  notificationController.deleteById);

router.post("/coupon"  ,  couponController.create);
router.patch("/coupon/:id" ,  couponController.updateById);
router.get("/coupon" ,  couponController.get);
router.get("/coupon/:id" , couponController.getById);
router.delete("/coupon/:id" ,  couponController.deleteById);

router.post("/type"  ,  typeController.create);
router.patch("/type/:id" ,  typeController.updateById);
router.get("/type" ,  typeController.get);
router.get("/type/:id" , typeController.getById);
router.delete("/type/:id" ,  typeController.deleteById);

router.post("/concern"  ,  concernController.create);
router.patch("/concern/:id" ,  concernController.updateById);
router.get("/concern" ,  concernController.get);
router.get("/concern/:id" , concernController.getById);
router.delete("/concern/:id" ,  concernController.deleteById);

router.post("/hiring"  ,  hiringController.create);
router.patch("/hiring/:id" ,  hiringController.updateById);
router.get("/hiring" ,  hiringController.get);
router.get("/hiring/:id" , hiringController.getById);
router.delete("/hiring/:id" ,  hiringController.deleteById);

router.post("/identity"  ,  IdentityController.create);
router.patch("/identity/:id" ,  IdentityController.updateById);
router.get("/identity" ,  IdentityController.get);
router.get("/identity/:id" , IdentityController.getById);
router.delete("/identity/:id" ,  IdentityController.deleteById);

router.post("/language"  ,  languageController.create);
router.patch("/language/:id" ,  languageController.updateById);
router.get("/language" ,  languageController.get);
router.get("/language/:id" , languageController.getById);
router.delete("/language/:id" ,  languageController.deleteById);

router.post("/experience"  ,  experienceController.create);
router.patch("/experience/:id" ,  experienceController.updateById);
router.get("/experience" ,  experienceController.get);
router.get("/experience/:id" , experienceController.getById);
router.delete("/experience/:id" ,  experienceController.deleteById);

router.get("/transaction" ,  transactionAdminController.get);
router.get("/transaction/:id" ,  transactionAdminController.getById);
router.patch("/transaction/:id" ,  transactionAdminController.updateById);
router.get("/settlement/transaction" ,  SettlementTransactionController.get);
router.get("/settlement/transaction/:id" ,  SettlementTransactionController.getById);
router.patch("/settlement/transaction/:id" ,  SettlementTransactionController.updateById);


router.get("/inquiry" ,  inquiryController.get);
router.get("/inquiry/:id" ,  inquiryController.getById);

// // Custom endpoints
router.get('/dashboard-stats', userControllerAdmin.getDashboardStats);

router.post('/doctorBook',  doctorBookingSlotController.createBookingAdmin);
router.get('/doctorBook', doctorBookingSlotController.get);
router.get('/doctorBook/:id', doctorBookingSlotController.getById);

router.post('/model/sync-index', inquiryController.syncIndexes);

router.get('/review', adminReviewController.get);
router.delete('/review/:id', adminReviewController.deleteById);

//report psychologist routes
router.get('/reportPsychologist', adminReportPsychologistController.get);
router.get('/reportPsychologist/:id', adminReportPsychologistController.getById);

module.exports =  router ;


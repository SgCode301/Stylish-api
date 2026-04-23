const  express =   require("express");
const   router   = express.Router();


const  {authController, otpauthController}  =  require("../controller/auth");
const { userController } = require("../controller/user");

router.post("/register" , authController.register);
//email , password
router.post("/login" , authController.login);
router.post("/sendOtp", authController.sendOtp);
router.post("/validateotp", authController.verifyOtp);
router.post("/forgotPassword", authController.forgotPassword);
router.post("/resetPassword", authController.resetPassword);
//mobile  , otp
router.post("/otp-login" , otpauthController.otpLogin);
router.post("/sendOtpMobile",otpauthController.sendOtp);
router.post("/verifyotp" , otpauthController.verifyOtp);

//delete account 
// router.delete("/delete-account", authMiddleware, userController.deleteAccount)


module.exports  =  router ;




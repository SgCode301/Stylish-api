const express = require("express");
const router = express.Router();
const serviceController = require("../controller/service");
const { patientAppointmentController, psychologistAppointmentController } = require("../controller/appointment");
const { transactionController } = require("../controller/transaction");
const { userController } = require("../controller/user");
const { userReviewController, psychologistreviewController } = require("../controller/review");
const { authController, otpauthController } = require("../controller/auth");
const { doctorBookingSlotController } = require("../controller/DoctorBookingSlotController");
const trackCallController = require("../controller/trackCallController");
const ceoFeedbackController = require("../controller/ceoFeedbackController");
const roomController = require("../controller/room");
const chatController = require("../controller/chat");
const { startCall, deductOneMinute } = require("../controller/callController");
const { userFollowController } = require("../controller/follow");
const notificationController = require("../controller/notification");
const reportController = require("../controller/report");
const { getBooking, adminReportPsychologistController } = require("../controller/reportPsychologist");


//appointmment
router.use(authController.authenticateToken);
router.post("/appointment", patientAppointmentController.create);
//user get  appointment details
router.get("/appointment", patientAppointmentController.get);
//psychologist get appointment details
router.get("/psychologist", psychologistAppointmentController.get);

router.post('/get-or-create-room', roomController.getOrCreateRoom);

// GET /chat/history/:roomId
router.get("/chat/history/:roomId", chatController.getMessagesByRoom);

router.get("/chat/my-rooms", roomController.getMyRooms);


// Doctor Book CRUD
router.get('/doctorBook', doctorBookingSlotController.get);
router.get('/doctorBook/myUpcomingSessions', doctorBookingSlotController.getMyUpcomingDoctorsSessions);
router.get('/doctorBook/:id', doctorBookingSlotController.getById);
router.post('/doctorBook', doctorBookingSlotController.bookSlotAndCreateTransaction);

//trackCall
router.post("/trackCall", trackCallController.createTrackCall);
router.get("/trackCall", trackCallController.get);
router.get("/trackCall/:id", trackCallController.getById);
router.patch("/trackCall/updateStatus/:id", trackCallController.updateTrackCallStatus);
router.patch("/trackCall/:id", trackCallController.updateById);

router.post("/ceoFeedback", ceoFeedbackController.create);
router.patch("/ceoFeedback/:id", ceoFeedbackController.updateById);
router.get("/ceoFeedback", ceoFeedbackController.get);
router.get("/ceoFeedback/:id", ceoFeedbackController.getById);

// POST /api/call/start
// router.post("/start/call", startCall);

// POST /api/call/start
router.post("/start/call", startCall);
router.post("/deduct/perMinute/cost", deductOneMinute);

//transaction

router.post("/transaction", transactionController.createTransaction);
router.get("/transaction", transactionController.get);

router.get("/notification/inbox", notificationController.getInbox);

router.post("/report", reportController.create);
router.get("/report", reportController.get);
router.get("/report/:id", reportController.getById);


//
router.get("/profile", authController.authenticateToken, userController.get);
router.put("/profile", authController.authenticateToken, authController.updateUser);


//review 
router.post("/review", authController.authenticateToken, userReviewController.addRatingReview);
router.get("/review", authController.authenticateToken, userReviewController.get);

//follow
router.post("/follow", authController.authenticateToken, userFollowController.toggleFollow);
router.get("/follow", authController.authenticateToken, userFollowController.get);
router.get("/follow/:id", authController.authenticateToken, userFollowController.getById);


//report psychologist routes
router.get('/reportPsychologist/:id', getBooking);
router.patch('/reportPsychologist/:id', adminReportPsychologistController.updateById);

//delete account 
router.delete("/delete-account",userController.deleteAccount)

module.exports = router;

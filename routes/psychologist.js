const express = require("express");
const router = express.Router();
const serviceController = require("../controller/service");
const { patientAppointmentController, psychologistAppointmentController } = require("../controller/appointment");
const { transactionPsychologistController } = require("../controller/transaction");
const { userController } = require("../controller/user");
const { userReviewController, psychologistreviewController } = require("../controller/review");
const { authController, otpauthController } = require("../controller/auth");
const { doctorAvailableSlotsController } = require("../controller/DoctorAvailableSlotsController");
const { doctorBookingSlotControllerForPsychologist } = require("../controller/DoctorBookingSlotController");
const { startCall } = require("../controller/callController");
const notificationController = require("../controller/notification");
const reportController = require("../controller/report");
const SettlementTransactionController = require("../controller/settlementTransaction");
const { getBooking, psychologistController, adminReportPsychologistController } = require("../controller/reportPsychologist");
const { getChatUsers, getChatMessages, sendChat } = require('../controller/ChatController');

//appointmment
router.use(authController.authenticateToken);

//transaction
router.get("/transaction", transactionPsychologistController.get);
router.patch("/transaction/request-settlement", transactionPsychologistController.requestSettlementForPsychologist);
router.get("/transaction/total-settlement-amount", transactionPsychologistController.getTotalSettlementAmount);
router.get("/settlement/transaction", SettlementTransactionController.get);

//profile
router.put("/profile/register", authController.authenticateToken, authController.updateUserRegister);
router.get("/profile", authController.authenticateToken, userController.get);
router.put("/profile", authController.authenticateToken, authController.updateUser);



router.get('/doctorBook', doctorBookingSlotControllerForPsychologist.get);

router.get("/notification/inbox", notificationController.getInbox);

router.post("/report", reportController.create);
router.get("/report", reportController.get);
router.get("/report/:id", reportController.getById);

// Slot CRUD
router.get('/doctorSlot', doctorAvailableSlotsController.get);
router.get('/doctorSlot/:id', doctorAvailableSlotsController.getById);
router.post('/doctorSlot', doctorAvailableSlotsController.create);
router.patch('/doctorSlot/:id', doctorAvailableSlotsController.updateById);
router.delete('/doctorSlot/:id', doctorAvailableSlotsController.deleteById);

router.get("/review", psychologistreviewController.get);

//report psychologist routes
router.get("/reportPsychologist/:id", getBooking);
router.get("/reportPsychologist", psychologistController.get);
router.post("/reportPsychologist", psychologistController.create);
router.patch("/reportPsychologist/:id", adminReportPsychologistController.updateById);

router.post("/start/call", startCall);

//Chat
router.get('/chat',getChatUsers)
router.get('/chat/messages/:receiverId',getChatMessages)
router.post('/chat',sendChat)


module.exports = router;

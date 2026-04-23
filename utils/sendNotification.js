// // utils/sendNotification.js
// const admin = require("../firebase");

// async function sendNotification(token, title, body, data = {}) {
//   const message = {
//     notification: { title, body },
//     token,
//     data: data, // Custom data for deep linking or call info
//     android: {
//       priority: "high",
//     },
//     apns: {
//       payload: {
//         aps: {
//           contentAvailable: true,
//         },
//       },
//     },
//   };

//   try {
//     const response = await admin.messaging().send(message);
//     console.log("Notification sent:", response);
//     return response;
//   } catch (err) {
//     console.error("Error sending notification:", err);
//     throw err;
//   }
// }

// module.exports = sendNotification;
// utils/sendNotification.js
const admin = require("../firebase");
const User = require("../models/User"); 

async function sendNotification(token, title, body, data = {}, userId = null) {
  if (!token) {
    console.log("FCM token not found, skipping notification");
    return null;
  }

  const message = {
    token,
    notification: { title, body },
    data,
    android: {
      priority: "high",
    },
    apns: {
      payload: {
        aps: {
          contentAvailable: true,
        },
      },
    },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("Notification sent:", response);
    return response;

  } catch (err) {
    console.error("FCM Error:", err.code || err.message);

    if (
      err.code === "messaging/registration-token-not-registered" ||
      err.code === "messaging/invalid-registration-token"
    ) {
      // console.log("Invalid FCM token detected, removing from DB");

      // if (userId) {
      //   await User.findByIdAndUpdate(userId, {
      //     $unset: { fcmToken: 1 }
      //   });
      // }
    }

    return null;
  }
}

module.exports = sendNotification;
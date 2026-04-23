// // firebase.js
// const admin = require("firebase-admin");
// const path = require("path");

// const serviceAccount = require(path.join(__dirname, "serviceAccountKey.json"));

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// module.exports = admin;
// firebase.js
const admin = require("firebase-admin");

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64) {
  throw new Error("Missing GOOGLE_APPLICATION_CREDENTIALS_BASE64");
}

const serviceAccount = JSON.parse(
  Buffer.from(
    process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64,
    "base64"
  ).toString("utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
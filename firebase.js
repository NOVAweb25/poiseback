// firebase.js
const admin = require("firebase-admin");
const path = require("path");

const serviceAccount = require(path.join(__dirname, "firebase-service-account.json"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
console.log("✅ Firebase Admin initialized:", admin.apps.length);

module.exports = admin;

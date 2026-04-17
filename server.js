const express = require("express");
const admin = require("firebase-admin");

const app = express();
app.use(express.json());

// Firebase admin init (must exist)
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// 🔥 THIS IS THE MISSING PART
app.post("/send", async (req, res) => {
  try {
    const { token, message } = req.body;

    const payload = {
      notification: {
        title: "New Message",
        body: message
      },
      token: token
    };

    await admin.messaging().send(payload);

    res.send("Notification sent");
  } catch (error) {
    console

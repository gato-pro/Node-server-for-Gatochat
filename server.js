const express = require("express");
const admin = require("firebase-admin");

const app = express();
app.use(express.json());

// Firebase init using ENV (NO JSON FILE)
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  }),
});

console.log("Firebase initialized");

// Health check
app.get("/", (req, res) => {
  res.send("Server running");
});

// Send notification
app.post("/send", async (req, res) => {
  try {
    const { token, message } = req.body;

    if (!token || !message) {
      return res.status(400).send("Missing token/message");
    }

    const response = await admin.messaging().send({
      token,
      notification: {
        title: "New Message",
        body: message,
      },
    });

    console.log("FCM SUCCESS:", response);
    res.send("Notification sent");

  } catch (err) {
    console.error("FCM ERROR:", err);
    res.status(500).send(err.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on", PORT));

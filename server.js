const express = require("express");
const admin = require("firebase-admin");

const app = express();
app.use(express.json());

// Firebase admin init
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Health check route (good for Render)
app.get("/", (req, res) => {
  res.send("Server is running");
});

// Send notification route
app.post("/send", async (req, res) => {
  try {
    const { token, message } = req.body;

    if (!token || !message) {
      return res.status(400).send("token and message are required");
    }

    const payload = {
      notification: {
        title: "New Message",
        body: message
      },
      token: token
    };

    const response = await admin.messaging().send(payload);

    console.log("Sent:", response);
    res.status(200).send("Notification sent");
  } catch (error) {
    console.error("FCM Error:", error);
    res.status(500).send(error.message);
  }
});

// 🔥 THIS WAS MISSING (critical fix)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

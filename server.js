const express = require("express");
const admin = require("firebase-admin");

const app = express();
app.use(express.json());

// -----------------------------
// Firebase Admin Init (safe)
// -----------------------------
try {
  const serviceAccount = require("./serviceAccountKey.json");

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  console.log("Firebase initialized successfully");
} catch (err) {
  console.error("Firebase init failed:", err);
}

// -----------------------------
// Request Logger (IMPORTANT DEBUG TOOL)
// -----------------------------
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// -----------------------------
// Health check route
// -----------------------------
app.get("/", (req, res) => {
  res.send("Server is running");
});

// -----------------------------
// Send notification route
// -----------------------------
app.post("/send", async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const { token, message } = req.body;

    if (!token || !message) {
      return res.status(400).send("token and message are required");
    }

    const payload = {
      token: token,
      notification: {
        title: "New Message",
        body: message
      }
    };

    const response = await admin.messaging().send(payload);

    console.log("FCM SUCCESS:", response);
    res.status(200).send("Notification sent");
  } catch (error) {
    console.error("FCM ERROR:", JSON.stringify(error, null, 2));
    res.status(500).send(error.message);
  }
});

// -----------------------------
// Start server (Render safe)
// -----------------------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

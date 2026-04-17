const express = require("express");
const admin = require("firebase-admin");

const app = express();
app.use(express.json());

// -----------------------------
// Firebase Init (SAFE + STRICT)
// -----------------------------
let firebaseReady = false;

try {
  const serviceAccount = require("./serviceAccountKey.json");

  if (!serviceAccount || !serviceAccount.private_key) {
    throw new Error("Invalid serviceAccountKey.json file");
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  firebaseReady = true;

  console.log("Firebase initialized successfully");
  console.log("PROJECT:", serviceAccount.project_id);
  console.log("CLIENT:", serviceAccount.client_email);

} catch (err) {
  console.error("❌ Firebase initialization FAILED:");
  console.error(err.message);
}

// -----------------------------
// Middleware
// -----------------------------
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// -----------------------------
// Health route
// -----------------------------
app.get("/", (req, res) => {
  res.send("Server is running");
});

// -----------------------------
// Send Notification
// -----------------------------
app.post("/send", async (req, res) => {
  console.log("BODY:", req.body);

  if (!firebaseReady) {
    return res.status(500).send("Firebase not initialized on server");
  }

  try {
    const { token, message } = req.body;

    if (!token || !message) {
      return res.status(400).send("token and message required");
    }

    const payload = {
      token: token,
      notification: {
        title: "New Message",
        body: message,
      },
    };

    const response = await admin.messaging().send(payload);

    console.log("FCM SUCCESS:", response);
    res.status(200).send("Notification sent");

  } catch (error) {
    console.error("FCM ERROR:", error);
    res.status(500).send(error.message);
  }
});

// -----------------------------
// Start server
// -----------------------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

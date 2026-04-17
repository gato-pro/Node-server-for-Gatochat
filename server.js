const express = require("express");
const admin = require("firebase-admin");

const app = express();
app.use(express.json());

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

app.post("/send", async (req, res) => {
  const { token, message } = req.body;

  const payload = {
    notification: {
      title: "New Message",
      body: message
    }
  };

  try {
    await admin.messaging().sendToDevice(token, payload);
    res.send("Notification sent");
  } catch (err) {
    res.status(500).send(err);
  }
});

app.listen(3000, () => console.log("Server running"));

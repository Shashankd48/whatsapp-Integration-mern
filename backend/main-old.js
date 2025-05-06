const express = require("express");
const { Client, LocalAuth } = require("whatsapp-web.js");
const QRCode = require("qrcode");
const cors = require("cors");

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize WhatsApp client
const client = new Client({
   authStrategy: new LocalAuth(), // stores session locally
   puppeteer: { headless: true },
});

// Event: when QR is received
let qrCode = null;
client.on("qr", (qr) => {
   qrCode = qr;
   console.log("QR RECEIVED");
});

// Event: ready
client.on("ready", () => {
   console.log("WhatsApp is ready!");
   qrCode = null;
});

// Start client
client.initialize();

app.get("/status", async (req, res) => {
   const isReady = client.info && client.info.wid;
   res.json({ status: isReady ? "authenticated" : "not_authenticated" });
});

// API to get QR code
app.get("/qr", async (req, res) => {
   if (!qrCode) {
      return res.json({ status: "authenticated" });
   }
   const qrImage = await QRCode.toDataURL(qrCode);
   res.json({ status: "pending", qr: qrImage });
});

// API to send a message
app.post("/send", async (req, res) => {
   const { number, message } = req.body;

   if (!number || !message) {
      return res.status(400).json({ error: "Missing number or message" });
   }

   const formattedNumber = number.includes("@c.us") ? number : `${number}@c.us`;

   try {
      await client.sendMessage(formattedNumber, message);
      res.json({ success: true, message: "Message sent" });
   } catch (err) {
      res.status(500).json({
         error: "Failed to send message",
         details: err.message,
      });
   }
});

app.listen(port, () => {
   console.log(`Server started at http://localhost:${port}`);
});

const express = require("express");
const { Client, LocalAuth } = require("whatsapp-web.js");
const QRCode = require("qrcode");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const clients = new Map(); // userId => { client, qr }

function createClient(userId) {
   const client = new Client({
      authStrategy: new LocalAuth({
         clientId: userId, // each user gets their own session
         dataPath: path.join(__dirname, "sessions"),
      }),
      puppeteer: { headless: true },
   });

   clients.set(userId, { client, qr: null });

   client.on("qr", (qr) => {
      console.log(`[${userId}] QR RECEIVED`);
      clients.get(userId).qr = qr;
   });

   client.on("ready", () => {
      console.log(`[${userId}] WhatsApp is ready`);
      clients.get(userId).qr = null;
   });

   client.initialize();
}

// API to start a session and return QR
app.get("/qr/:userId", async (req, res) => {
   const { userId } = req.params;

   if (!clients.has(userId)) {
      createClient(userId);
      return res.json({
         status: "starting",
         message: "Client initializing...",
      });
   }

   const { qr, client } = clients.get(userId);
   const isReady = client.info && client.info.wid;

   if (isReady) {
      return res.json({ status: "authenticated" });
   } else if (qr) {
      const qrImage = await QRCode.toDataURL(qr);
      return res.json({ status: "pending", qr: qrImage });
   } else {
      return res.json({ status: "starting" });
   }
});

// API to check authentication status
app.get("/status/:userId", async (req, res) => {
   const { userId } = req.params;
   const entry = clients.get(userId);

   if (!entry) return res.json({ status: "not_initialized" });

   const isReady = entry.client.info && entry.client.info.wid;
   return res.json({ status: isReady ? "authenticated" : "not_authenticated" });
});

// API to send a message
app.post("/send/:userId", async (req, res) => {
   const { userId } = req.params;
   const { number, message } = req.body;

   if (!number || !message) {
      return res.status(400).json({ error: "Missing number or message" });
   }

   const entry = clients.get(userId);
   if (!entry) return res.status(404).json({ error: "Client not initialized" });

   const client = entry.client;
   const isReady = client.info && client.info.wid;

   if (!isReady)
      return res.status(403).json({ error: "Client not authenticated" });

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
   console.log(
      `Multi-user WhatsApp server started at http://localhost:${port}`
   );
});

const express = require("express");
const { Client, LocalAuth } = require("whatsapp-web.js");
const QRCode = require("qrcode");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const SESSIONS_DIR = path.join(__dirname, "sessions");
const clients = new Map(); // userId -> client
const qrCodes = new Map(); // userId -> qr

// Create a WhatsApp client per userId
const createClient = (userId) => {
   if (clients.has(userId)) return clients.get(userId);

   const client = new Client({
      authStrategy: new LocalAuth({
         clientId: userId,
         dataPath: SESSIONS_DIR,
      }),
      puppeteer: { headless: true },
   });

   client.on("qr", (qr) => {
      console.log(`[${userId}] QR Code received`);
      qrCodes.set(userId, qr);
   });

   client.on("ready", () => {
      console.log(`[${userId}] WhatsApp is ready!`);
      qrCodes.delete(userId);
   });

   client.on("auth_failure", (msg) => {
      console.error(`[${userId}] Authentication failure:`, msg);
      qrCodes.delete(userId);
   });

   client.on("disconnected", (reason) => {
      console.warn(`[${userId}] Disconnected:`, reason);
      clients.delete(userId);
      qrCodes.delete(userId);
   });

   client.initialize();
   clients.set(userId, client);
   return client;
};

// Restore sessions from disk on server restart
if (fs.existsSync(SESSIONS_DIR)) {
   const userDirs = fs.readdirSync(SESSIONS_DIR);
   userDirs.forEach((userId) => {
      try {
         console.log(`Restoring session for ${userId}`);
         createClient(userId);
      } catch (err) {
         console.error(`Failed to restore ${userId}:`, err.message);
      }
   });
}

app.get("/", async (req, res) => {
   return res.status(200).send("Server is up and running 😊");
});

// GET /qr/:userId → returns QR or status
app.get("/qr/:userId", async (req, res) => {
   const userId = req.params.userId;
   const client = createClient(userId);

   if (!qrCodes.has(userId)) {
      return res.json({ status: "authenticated" });
   }

   try {
      const qr = qrCodes.get(userId);
      const qrImage = await QRCode.toDataURL(qr);
      res.json({ status: "pending", qr: qrImage });
   } catch (err) {
      res.status(500).json({
         error: "Failed to generate QR",
         details: err.message,
      });
   }
});

// GET /status/:userId → is authenticated or not
app.get("/status/:userId", (req, res) => {
   const client = clients.get(req.params.userId);
   const isReady = client && client.info && client.info.wid;
   res.json({ status: isReady ? "authenticated" : "not_authenticated" });
});

// POST /send → send message
app.post("/send", async (req, res) => {
   const { userId, number, message } = req.body;

   if (!userId || !number || !message) {
      return res
         .status(400)
         .json({ error: "Missing userId, number or message" });
   }

   const client = clients.get(userId);
   if (!client || !client.info) {
      return res
         .status(400)
         .json({ error: "Client not ready or not initialized" });
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
   console.log(`🚀 Server started on http://localhost:${port}`);
});

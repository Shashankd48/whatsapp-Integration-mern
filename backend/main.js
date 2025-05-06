import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS
app.use(cors());

// Enable JSON and URL-encoded form parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sample GET API
app.get("/ping", (req, res) => {
   res.json({ message: "pong" });
});

// Sample POST API
app.post("/hello", (req, res) => {
   const { name } = req.body;
   res.json({ message: `Hello, ${name || "Guest"}!` });
});

// Start the server
app.listen(PORT, () => {
   console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

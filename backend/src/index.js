const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth");
const tradingRoutes = require("./routes/trading");
const paymentRoutes = require("./routes/payments");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow localhost on any port during development
    if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      callback(null, true);
    } else if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies to be sent with requests
}));
app.use(express.json());
app.use(cookieParser()); // Parse cookies from requests

// Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/trading", tradingRoutes);
app.use("/api/payments", paymentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`Trading App Backend running on http://localhost:${PORT}`);
  console.log(`CORS enabled for: ${process.env.FRONTEND_URL || "http://localhost:3000"}`);
});

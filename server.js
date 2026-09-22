const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const authRoutes = require("./authRoutes");
const businessRoutes = require("./businessRoutes");

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/businesses", businessRoutes);

// Frontend Dashboard
const path = require("path");

app.use(express.static(__dirname));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "dashboard.html"));
});

// Health Check
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        server: "running",
        database: mongoose.connection.readyState === 1
            ? "connected"
            : "not connected"
    });
});

// MongoDB Connection
const MONGODB_URI =
    process.env.MONGODB_URI ||
    "mongodb://127.0.0.1:27017/business_risk_system";

mongoose
    .connect(MONGODB_URI)
    .then(() => {
        console.log("✅ MongoDB Connected");
    })
    .catch((error) => {
        console.error("❌ MongoDB Connection Error:", error.message);
    });

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

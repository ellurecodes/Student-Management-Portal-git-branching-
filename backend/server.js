require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const studentRoutes = require("./routes/studentRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "100kb" }));

app.get("/", (req, res) => {
  res.json({
    name: "CampusCore Student Information API",
    status: "running",
    database: mongoose.connection.readyState === 1 ? "mongodb" : "local-storage-fallback",
    endpoints: {
      students: "/api/students",
      health: "/api/health"
    }
  });
});

app.get("/api/health", (req, res) => {
  const isMongoConnected = mongoose.connection.readyState === 1;
  res.status(200).json({
    success: true,
    server: "running",
    database: isMongoConnected ? "connected" : "local-storage"
  });
});

app.use("/api/students", studentRoutes);

// Handle invalid JSON bodies
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({ success: false, message: "Invalid JSON request body" });
  }
  next(err);
});

async function startServer() {
  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/enamm_students";

  try {
    // Attempt MongoDB connection with 2-second timeout
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.log("--------------------------------------------------");
    console.log("Notice: Local MongoDB server is not running or unreachable.");
    console.log(`Error: ${error.message}`);
    console.log("Starting backend with built-in Local Storage fallback.");
    console.log("All student operations (CRUD) will work normally!");
    console.log("--------------------------------------------------");
  }

  app.listen(PORT, () => {
    console.log(`API running at http://localhost:${PORT}`);
  });
}

startServer();

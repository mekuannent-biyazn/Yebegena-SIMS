import dotenv from "dotenv";
import { createServer } from "http";

dotenv.config();

import app from "./app.mjs";
import connectDB from "./config/db.mjs";
import { initializeSocket } from "./config/socketio.mjs";

// Connect to MongoDB
connectDB();

// Create HTTP server
const server = createServer(app);

// Initialize Socket.io
const io = initializeSocket(server, {
  corsOrigin: process.env.CLIENT_URL || "http://localhost:5173",
});

// Make io available in app
app.set("io", io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔌 Socket.io enabled for real-time notifications`);
});

// Handle graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, closing server...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received, closing server...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

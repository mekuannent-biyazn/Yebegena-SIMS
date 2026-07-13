import io from "socket.io-client";

// Get the WebSocket URL from environment variables
const WS_URL =
  import.meta.env.VITE_WS_URL ||
  import.meta.env.VITE_API_URL?.replace(/^http/, "ws") ||
  "ws://localhost:5000";

// Create socket instance with authentication
let socket = null;

export const initializeSocket = (token, userId) => {
  if (socket) {
    socket.disconnect();
  }

  socket = io(WS_URL, {
    auth: {
      token: token,
    },
    query: {
      userId: userId,
    },
    transports: ["websocket", "polling"],
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected successfully");
  });

  socket.on("connect_error", (error) => {
    console.error("❌ Socket connection error:", error.message);
  });

  socket.on("disconnect", (reason) => {
    console.log("🔴 Socket disconnected:", reason);
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    throw new Error("Socket not initialized. Call initializeSocket first.");
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// For backward compatibility
export default socket;

import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io = null;

/**
 * Initialize Socket.io with the HTTP server
 */
export const initializeSocket = (server, options = {}) => {
  if (io) {
    console.log("⚠️ Socket.io already initialized");
    return io;
  }

  const corsOrigin =
    options.corsOrigin || process.env.CLIENT_URL || "http://localhost:5173";

  io = new Server(server, {
    cors: {
      origin: corsOrigin,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ["websocket", "polling"],
    allowEIO3: true,
    ...options,
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const userId = socket.handshake.query.userId;

      if (!token || !userId) {
        socket.isAuthenticated = false;
        return next();
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id || userId;
        socket.userRole = decoded.role;
        socket.isAuthenticated = true;
        console.log(`✅ Socket authenticated: User ${socket.userId}`);
      } catch (jwtError) {
        console.error("❌ JWT Verification failed:", jwtError.message);
        socket.isAuthenticated = false;
      }

      next();
    } catch (error) {
      console.error("❌ Socket auth error:", error);
      socket.isAuthenticated = false;
      next();
    }
  });

  // Connection handler
  io.on("connection", (socket) => {
    const userId = socket.userId || socket.handshake.query.userId;
    const isAuth = socket.isAuthenticated || false;

    console.log(
      `🟢 Socket connected: ${socket.id} (User: ${userId || "anonymous"}, Auth: ${isAuth})`,
    );

    // Join user's personal room
    if (userId) {
      socket.join(`user_${userId}`);
      console.log(`📢 User ${userId} joined their room`);
    }

    // Join admin room
    socket.on("join-admin", () => {
      if (socket.userRole === "ADMIN") {
        socket.join("admin_room");
        console.log(`📢 Admin ${userId} joined admin room`);
        socket.emit("admin-joined", { success: true });
      } else {
        socket.emit("admin-joined", {
          success: false,
          message: "Not authorized",
        });
      }
    });

    // Leave admin room
    socket.on("leave-admin", () => {
      socket.leave("admin_room");
      console.log(`📢 User ${userId} left admin room`);
    });

    // Handle private messages
    socket.on("private-message", (data) => {
      const { recipientId, message } = data;
      if (recipientId) {
        io.to(`user_${recipientId}`).emit("private-message", {
          from: userId,
          message,
          timestamp: new Date(),
        });
      }
    });

    // Handle disconnection
    socket.on("disconnect", (reason) => {
      console.log(
        `🔴 Socket disconnected: ${socket.id} (User: ${userId || "anonymous"}, Reason: ${reason})`,
      );
    });

    // Handle errors
    socket.on("error", (error) => {
      console.error(`❌ Socket error for ${socket.id}:`, error);
    });
  });

  global.io = io;
  console.log("✅ Socket.io initialized successfully");
  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized. Call initializeSocket first.");
  }
  return io;
};

export const emitNotification = (userId, notification, sendToAdmin = false) => {
  const socketIO = getIO();

  if (userId) {
    socketIO.to(`user_${userId}`).emit("new_notification", notification);
    console.log(`📨 Notification sent to user ${userId}`);
  }

  if (sendToAdmin) {
    socketIO.to("admin_room").emit("new_notification", {
      ...notification,
      isAdminNotification: true,
    });
    console.log(`📨 Notification sent to admin room`);
  }

  if (notification.recipientType === "ALL") {
    socketIO.emit("new_notification", notification);
    console.log(`📨 Broadcast notification to all`);
  }
};

export const broadcast = (event, data) => {
  const socketIO = getIO();
  socketIO.emit(event, data);
  console.log(`📢 Broadcasted ${event} to all clients`);
};

export default {
  initializeSocket,
  getIO,
  emitNotification,
  broadcast,
};

import React, { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { useAuthStore } from "../store/authStore";

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, token } = useAuthStore();

  useEffect(() => {
    if (!user || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Get WebSocket URL from environment variable
    const WS_URL =
      import.meta.env.VITE_WS_URL ||
      import.meta.env.VITE_API_URL?.replace(/^http/, "ws") ||
      "ws://localhost:5000";

    console.log("🔌 Connecting to WebSocket at:", WS_URL);

    // Connect to socket server
    const newSocket = io(WS_URL, {
      auth: {
        token: token,
      },
      query: {
        userId: user._id,
      },
      transports: ["websocket", "polling"],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on("connect", () => {
      console.log("🔗 Socket connected");
      setIsConnected(true);

      // If user is admin, join admin room
      if (user.role === "ADMIN") {
        newSocket.emit("join-admin");
      }
    });

    newSocket.on("disconnect", (reason) => {
      console.log("🔌 Socket disconnected:", reason);
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error.message);
      setIsConnected(false);
    });

    newSocket.on("reconnect", (attemptNumber) => {
      console.log(`🔄 Socket reconnected after ${attemptNumber} attempts`);
      setIsConnected(true);
    });

    newSocket.on("reconnect_error", (error) => {
      console.error("❌ Socket reconnection error:", error.message);
    });

    setSocket(newSocket);

    return () => {
      console.log("🧹 Cleaning up socket connection");
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [user, token]);

  const value = {
    socket,
    isConnected,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export default SocketContext;

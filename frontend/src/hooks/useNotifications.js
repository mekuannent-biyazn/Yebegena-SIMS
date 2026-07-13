import { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";
import { useAuthStore } from "../store/authStore";
import { notificationService } from "../services/notificationService";
import toast from "react-hot-toast";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { socket, isConnected } = useSocket();
  const { user } = useAuthStore();

  // Load initial notifications
  useEffect(() => {
    if (!user) return;

    const loadNotifications = async () => {
      setLoading(true);
      try {
        const response = await notificationService.getMyNotifications();
        setNotifications(response.data || []);
        console.log("📋 Loaded notifications:", response.data?.length || 0);

        const countResponse = await notificationService.getUnreadCount();
        setUnreadCount(countResponse.count || 0);
      } catch (error) {
        console.error("❌ Failed to load notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [user]);

  // Listen for new notifications via socket
  useEffect(() => {
    if (!socket || !isConnected) {
      console.log("🔌 Socket not connected, waiting for notifications...");
      return;
    }

    const handleNewNotification = (notification) => {
      console.log("📨 New notification received:", notification);

      // Add to notifications list
      setNotifications((prev) => {
        // Prevent duplicate notifications
        const exists = prev.some((n) => n._id === notification._id);
        if (exists) return prev;
        return [notification, ...prev];
      });

      // Increment unread count
      setUnreadCount((prev) => prev + 1);

      // Show toast notification with better styling
      toast.success(notification.message || "New notification", {
        icon: "🔔",
        duration: 5000,
        style: {
          background: "#333",
          color: "#fff",
        },
      });
    };

    socket.on("new_notification", handleNewNotification);

    return () => {
      socket.off("new_notification", handleNewNotification);
    };
  }, [socket, isConnected]);

  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      return true;
    } catch (error) {
      console.error("❌ Failed to mark notification as read:", error);
      toast.error("Failed to mark as read");
      return false;
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));

      // If it was unread, decrement count
      const wasUnread = notifications.find(
        (n) => n._id === notificationId && !n.isRead,
      );
      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      toast.success("Notification deleted");
      return true;
    } catch (error) {
      console.error("❌ Failed to delete notification:", error);
      toast.error("Failed to delete notification");
      return false;
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.isRead);
      if (unreadNotifications.length === 0) {
        toast("No unread notifications");
        return false;
      }

      await Promise.all(
        unreadNotifications.map((n) => notificationService.markAsRead(n._id)),
      );

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
      return true;
    } catch (error) {
      console.error("❌ Failed to mark all as read:", error);
      toast.error("Failed to mark all as read");
      return false;
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    isConnected,
    markAsRead,
    deleteNotification,
    markAllAsRead,
  };
};

export default useNotifications;

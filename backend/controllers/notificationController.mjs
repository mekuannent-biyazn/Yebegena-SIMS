import Notification from "../models/Notification.mjs";
import {
  getNotifications,
  markAsRead,
  unreadCount,
  deleteNotification,
} from "../services/notificationService.mjs";

export const getMyNotifications = async (req, res) => {
  try {
    console.log("📨 Getting notifications for user:", req.user._id);

    const notifications = await getNotifications(req.user);

    console.log(`📨 Found ${notifications.length} notifications`);

    return res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    console.error("Error getting notifications:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get notifications",
    });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    console.log("📨 Getting unread count for user:", req.user._id);

    const count = await unreadCount(req.user);

    return res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    console.error("Error getting unread count:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get unread count",
    });
  }
};

export const readNotification = async (req, res) => {
  try {
    const notification = await markAsRead(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to mark notification as read",
    });
  }
};

export const removeNotification = async (req, res) => {
  try {
    const notification = await deleteNotification(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete notification",
    });
  }
};

export const getAllNotifications = async (req, res) => {
  try {
    console.log("📨 Admin getting all notifications");

    const notifications = await Notification.find()
      .populate("recipient", "fullName phoneNumber")
      .populate("createdBy", "fullName")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    console.error("Error getting all notifications:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get all notifications",
    });
  }
};

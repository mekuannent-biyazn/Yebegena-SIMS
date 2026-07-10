import Notification from "../models/Notification.mjs";
import { getIO } from "../config/socketio.mjs";

export const createNotification = async ({
  title,
  message,
  type = "INFO",
  recipientType,
  recipient = null,
  createdBy = null,
  expiresAt = null,
}) => {
  try {
    // Validate recipientType
    if (!recipientType) {
      throw new Error("recipientType is required");
    }

    const notification = await Notification.create({
      title,
      message,
      type,
      recipientType,
      recipient,
      createdBy,
      expiresAt,
    });

    // Populate the notification for sending via socket
    const populatedNotification = await Notification.findById(notification._id)
      .populate("recipient", "fullName phoneNumber")
      .populate("createdBy", "fullName");

    // Send real-time notification via Socket.io
    try {
      const io = getIO();

      if (recipient) {
        io.to(`user_${recipient}`).emit(
          "new_notification",
          populatedNotification,
        );
        console.log(`📨 Notification sent to user ${recipient}`);
      }

      if (recipientType === "STUDENT") {
        io.to("admin_room").emit("new_notification", {
          ...populatedNotification.toObject(),
          isAdminNotification: true,
        });
      }

      if (recipientType === "ALL") {
        io.emit("new_notification", populatedNotification);
      }
    } catch (socketError) {
      console.error("Socket error:", socketError);
      // Don't fail the notification creation
    }

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

export const getNotifications = async (user) => {
  try {
    if (!user) {
      throw new Error("User is required");
    }

    const notifications = await Notification.find({
      isActive: true,
      $or: [
        { recipientType: "ALL" },
        { recipientType: user.role },
        { recipient: user._id },
      ],
    })
      .populate("recipient", "fullName phoneNumber")
      .populate("createdBy", "fullName")
      .sort({ createdAt: -1 });

    return notifications;
  } catch (error) {
    console.error("Error getting notifications:", error);
    throw error;
  }
};

export const markAsRead = async (notificationId) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true },
    );
    return notification;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

export const deleteNotification = async (notificationId) => {
  try {
    const notification = await Notification.findByIdAndDelete(notificationId);
    return notification;
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
};

export const unreadCount = async (user) => {
  try {
    if (!user) {
      throw new Error("User is required");
    }

    const count = await Notification.countDocuments({
      isRead: false,
      $or: [
        { recipientType: "ALL" },
        { recipientType: user.role },
        { recipient: user._id },
      ],
    });
    return count;
  } catch (error) {
    console.error("Error getting unread count:", error);
    throw error;
  }
};

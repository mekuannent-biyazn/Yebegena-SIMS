import Notification from "../models/Notification.mjs";

export const createNotification = async ({
  title,
  message,
  type = "INFO",
  recipientType,
  recipient = null,
  createdBy = null,
  expiresAt = null,
}) => {
  return Notification.create({
    title,
    message,
    type,
    recipientType,
    recipient,
    createdBy,
    expiresAt,
  });
};

export const getNotifications = async (user) => {
  return Notification.find({
    isActive: true,
    $or: [
      {
        recipientType: "ALL",
      },
      {
        recipientType: user.role,
      },
      {
        recipient: user._id,
      },
    ],
  }).sort({
    createdAt: -1,
  });
};

export const markAsRead = async (notificationId) => {
  return Notification.findByIdAndUpdate(
    notificationId,
    {
      isRead: true,
    },
    {
      new: true,
    },
  );
};

export const deleteNotification = async (notificationId) => {
  return Notification.findByIdAndDelete(notificationId);
};

export const unreadCount = async (user) => {
  return Notification.countDocuments({
    isRead: false,
    $or: [
      {
        recipientType: "ALL",
      },
      {
        recipientType: user.role,
      },
      {
        recipient: user._id,
      },
    ],
  });
};

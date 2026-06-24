import Notification from "../models/Notification.mjs";

export const createNotification = async ({
  recipient,
  title,
  message,
  type = "SYSTEM",
  createdBy = null,
}) => {
  return await Notification.create({
    recipient,
    title,
    message,
    type,
    createdBy,
  });
};

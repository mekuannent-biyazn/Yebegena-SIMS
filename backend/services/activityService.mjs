import ActivityLog from "../models/ActivityLog.mjs";

export const logActivity = async ({
  user,
  action,
  module,
  description,
  metadata = {},
  req = null,
}) => {
  try {
    await ActivityLog.create({
      user,
      action,
      module,
      description,
      metadata,

      ipAddress:
        req?.headers["x-forwarded-for"] || req?.socket?.remoteAddress || "",

      userAgent: req?.headers["user-agent"] || "",
    });
  } catch (error) {
    console.error("Activity Log Error:", error.message);
  }
};

export const getRecentActivities = async (limit = 10) => {
  return ActivityLog.find()
    .populate("user", "fullName phoneNumber role")
    .sort({
      createdAt: -1,
    })
    .limit(limit);
};

export const deleteOldActivities = async (days = 365) => {
  const date = new Date();

  date.setDate(date.getDate() - days);

  return ActivityLog.deleteMany({
    createdAt: {
      $lt: date,
    },
  });
};

import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    action: {
      type: String,
      required: true,
      trim: true,
    },

    module: {
      type: String,
      required: true,
      enum: [
        "AUTH",
        "STUDENT",
        "TEACHER",
        "PAYMENT",
        "CLASS",
        "EXAM",
        "SCHEDULE",
        "KFLAT",
        "NOTIFICATION",
        "SYSTEM",
      ],
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    ipAddress: {
      type: String,
      default: "",
    },

    userAgent: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ module: 1 });
activityLogSchema.index({ user: 1 });

export default mongoose.model("ActivityLog", activityLogSchema);

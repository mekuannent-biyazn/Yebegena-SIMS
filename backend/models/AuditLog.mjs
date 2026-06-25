import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    module: {
      type: String,
      required: true,
    },

    action: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    ipAddress: String,
  },
  {
    timestamps: true,
  },
);

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;

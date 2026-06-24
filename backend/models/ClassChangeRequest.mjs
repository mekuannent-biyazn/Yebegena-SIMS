import mongoose from "mongoose";

const classChangeRequestSchema = new mongoose.Schema(
  {
    requesterStudent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    targetStudent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },

    requesterClass: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    targetClass: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED", "APPROVED"],
      default: "PENDING",
    },

    adminComment: {
      type: String,
      trim: true,
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

const ClassChangeRequest = mongoose.model(
  "ClassChangeRequest",
  classChangeRequestSchema,
);

export default ClassChangeRequest;

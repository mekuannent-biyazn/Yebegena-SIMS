import mongoose from "mongoose";

const classChangeRequestSchema = new mongoose.Schema(
  {
    requesterStudent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    currentClass: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    desiredClass: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },

    reason: {
      type: String,
      trim: true,
    },

    matchedStudent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },

    status: {
      type: String,
      enum: ["OPEN", "MATCHED", "APPROVED", "REJECTED", "CANCELLED"],
      default: "OPEN",
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    approvedAt: Date,
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

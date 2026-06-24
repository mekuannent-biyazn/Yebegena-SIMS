import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    kflat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Kflat",
      required: true,
    },

    kflatRole: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "KflatRole",
    },

    customKflatRole: {
      type: String,
      trim: true,
    },

    assignedClass: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },

    studentStatus: {
      type: String,
      enum: ["FRESH", "ADVANCED"],
      default: "FRESH",
    },

    registrationApproved: {
      type: Boolean,
      default: false,
    },

    registrationStatus: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const Student = mongoose.model("Student", studentSchema);

export default Student;

import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
  {
    className: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    classType: {
      type: String,
      enum: ["FRESH", "ADVANCED"],
      required: true,
    },

    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
    },

    maxStudents: {
      type: Number,
      required: true,
      min: 1,
    },

    currentStudents: {
      type: Number,
      default: 0,
    },

    classChangeDeadline: {
      type: Date,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

const Class = mongoose.model("Class", classSchema);

export default Class;

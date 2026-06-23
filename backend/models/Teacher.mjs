import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    teacherType: {
      type: String,
      enum: ["FRESH_TEACHER", "ADVANCED_TEACHER"],
      required: true,
    },

    specialization: {
      type: String,
      trim: true,
      default: "",
    },

    assignedClasses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const Teacher = mongoose.model("Teacher", teacherSchema);

export default Teacher;

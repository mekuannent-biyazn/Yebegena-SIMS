import mongoose from "mongoose";

const examSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    examType: {
      type: String,
      enum: ["WRITTEN", "PRACTICAL"],
      required: true,
    },

    examDate: {
      type: Date,
      required: true,
    },

    location: {
      type: String,
      trim: true,
    },

    maxScore: {
      type: Number,
      default: 100,
    },

    passingScore: {
      type: Number,
      default: 50,
    },

    description: {
      type: String,
      trim: true,
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

const Exam = mongoose.model("Exam", examSchema);

export default Exam;

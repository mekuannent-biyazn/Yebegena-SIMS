import mongoose from "mongoose";

const examResultSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    score: {
      type: Number,
      required: true,
    },

    isPassed: {
      type: Boolean,
      default: false,
    },

    remark: {
      type: String,
      trim: true,
    },

    enteredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

examResultSchema.index(
  {
    examId: 1,
    studentId: 1,
  },
  {
    unique: true,
  },
);

const ExamResult = mongoose.model("ExamResult", examResultSchema);

export default ExamResult;

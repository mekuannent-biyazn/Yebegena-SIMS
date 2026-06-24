import mongoose from "mongoose";

const classChangeWindowSchema = new mongoose.Schema(
  {
    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
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

const ClassChangeWindow = mongoose.model(
  "ClassChangeWindow",
  classChangeWindowSchema,
);

export default ClassChangeWindow;

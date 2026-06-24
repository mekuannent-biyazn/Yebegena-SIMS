import mongoose from "mongoose";

const paymentConfigSchema = new mongoose.Schema(
  {
    studentType: {
      type: String,
      enum: ["FRESH", "ADVANCED"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    startDay: {
      type: Number,
      required: true,
      min: 1,
      max: 31,
    },

    endDay: {
      type: Number,
      required: true,
      min: 1,
      max: 31,
    },

    autoGenerate: {
      type: Boolean,
      default: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

const PaymentConfig = mongoose.model("PaymentConfig", paymentConfigSchema);

export default PaymentConfig;

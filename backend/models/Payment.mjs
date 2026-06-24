import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    paymentMonth: {
      type: Number,
      required: true,
    },

    paymentYear: {
      type: Number,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    receiptImage: {
      type: String,
      required: true,
    },

    cloudinaryPublicId: {
      type: String,
    },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },

    rejectionReason: {
      type: String,
      trim: true,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

paymentSchema.index(
  {
    student: 1,
    paymentMonth: 1,
    paymentYear: 1,
  },
  {
    unique: true,
  },
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;

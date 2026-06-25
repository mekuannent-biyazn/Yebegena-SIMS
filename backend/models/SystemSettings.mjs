import mongoose from "mongoose";

const systemSettingSchema = new mongoose.Schema(
  {
    monthlyFeeAmount: {
      type: Number,
      default: 0,
    },

    paymentPeriodStartDay: {
      type: Number,
      default: 1,
    },

    paymentPeriodEndDay: {
      type: Number,
      default: 10,
    },

    classChangeEnabled: {
      type: Boolean,
      default: false,
    },

    academicYear: {
      type: String,
      required: true,
    },

    defaultLanguage: {
      type: String,
      enum: ["en", "am"],
      default: "en",
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

const SystemSetting = mongoose.model("SystemSetting", systemSettingSchema);

export default SystemSetting;

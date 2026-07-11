import mongoose from "mongoose";

const systemSettingSchema = new mongoose.Schema(
  {
    // Fresh Student Payment Settings
    freshStudentFee: {
      type: Number,
      default: 1000,
    },

    // Advanced Student Payment Settings
    advancedStudentFee: {
      type: Number,
      default: 1500,
    },

    // Payment Period Settings
    paymentPeriodStartDay: {
      type: Number,
      default: 1,
      min: 1,
      max: 31,
    },

    paymentPeriodEndDay: {
      type: Number,
      default: 10,
      min: 1,
      max: 31,
    },

    // Other Settings
    classChangeEnabled: {
      type: Boolean,
      default: false,
    },

    academicYear: {
      type: String,
      required: true,
      default: new Date().getFullYear() + "/" + (new Date().getFullYear() + 1),
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

import mongoose from "mongoose";

const kflatRoleSchema = new mongoose.Schema(
  {
    roleName: {
      en: {
        type: String,
        required: true,
        trim: true,
      },

      am: {
        type: String,
        required: true,
        trim: true,
      },
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

kflatRoleSchema.index(
  {
    "roleName.en": 1,
  },
  {
    unique: true,
  },
);

const KflatRole = mongoose.model("KflatRole", kflatRoleSchema);

export default KflatRole;

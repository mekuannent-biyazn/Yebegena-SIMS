import express from "express";

import {
  register,
  login,
  changePassword,
  updateProfile,
  deleteProfilePicture,
  getProfile,
} from "../controllers/authController.mjs";
import upload from "../middlewares/uploadePaymentImage.mjs";
import protect from "../middlewares/authMiddleware.mjs";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/change-password", protect, changePassword);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, upload.single("picture"), updateProfile);
router.delete("/profile/picture", protect, deleteProfilePicture);

export default router;

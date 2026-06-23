import express from "express";

import {
  register,
  login,
  changePassword,
} from "../controllers/authController.mjs";
import protect from "../middlewares/authMiddleware.mjs";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);
router.post("/change-password", protect, changePassword);

export default router;

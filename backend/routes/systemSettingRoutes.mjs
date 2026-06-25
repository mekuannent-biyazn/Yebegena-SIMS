import express from "express";

import protect from "../middlewares/authMiddleware.mjs";
import authorize from "../middlewares/roleMiddleware.mjs";

import {
  getSettings,
  updateSettings,
} from "../controllers/systemSettingController.mjs";

const router = express.Router();

router.get("/", protect, authorize("ADMIN"), getSettings);

router.put("/", protect, authorize("ADMIN"), updateSettings);

export default router;

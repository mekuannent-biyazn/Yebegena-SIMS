import express from "express";

import protect from "../middlewares/authMiddleware.mjs";
import authorize from "../middlewares/roleMiddleware.mjs";

import {
  createSchedule,
  createTutorialSchedule,
  getClassSchedules,
  updateSchedule,
} from "../controllers/scheduleController.mjs";

const router = express.Router();

router.post("/", protect, authorize("ADMIN"), createSchedule);

router.post("/tutorial", protect, authorize("TEACHER"), createTutorialSchedule);

router.get("/class/:classId", protect, getClassSchedules);

router.put("/:id", protect, authorize("ADMIN", "TEACHER"), updateSchedule);

export default router;

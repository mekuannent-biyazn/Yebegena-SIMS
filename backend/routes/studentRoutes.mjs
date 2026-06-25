import express from "express";

import protect from "../middlewares/authMiddleware.mjs";
import authorize from "../middlewares/roleMiddleware.mjs";

import {
  getMyProfile,
  approveStudent,
  assignStudentToClass,
  getPendingStudents,
  rejectStudent,
  studentStats,
  studentReport,
} from "../controllers/studentController.mjs";

const router = express.Router();

router.get("/profile", protect, getMyProfile);

router.get("/pending", protect, authorize("ADMIN"), getPendingStudents);

router.put("/approve/:id", protect, authorize("ADMIN"), approveStudent);

router.put("/assign-class", protect, authorize("ADMIN"), assignStudentToClass);

router.put("/reject/:id", protect, authorize("ADMIN"), rejectStudent);

router.get("/stats", protect, authorize("ADMIN"), studentStats);

router.get("/students", protect, authorize("ADMIN"), studentReport);

export default router;

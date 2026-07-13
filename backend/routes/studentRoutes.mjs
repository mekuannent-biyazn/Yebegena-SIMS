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
  getStudentById,
  assignStudentToClassWithParam,
} from "../controllers/studentController.mjs";

const router = express.Router();

router.get("/profile", protect, getMyProfile);

router.get("/students", protect, authorize("TEACHER"), studentReport);

router.get("/pending", protect, authorize("ADMIN"), getPendingStudents);

router.put("/approve/:id", protect, authorize("ADMIN"), approveStudent);

router.put("/assign-class", protect, authorize("ADMIN"), assignStudentToClass);

router.put("/reject/:id", protect, authorize("ADMIN"), rejectStudent);

router.get("/stats", protect, authorize("ADMIN"), studentStats);

router.get("/:id", protect, authorize("ADMIN"), getStudentById);

router.patch(
  "/:studentId/assign-class",
  protect,
  authorize("ADMIN"),
  assignStudentToClassWithParam,
);

export default router;

import express from "express";
import protect from "../middlewares/authMiddleware.mjs";
import authorize from "../middlewares/roleMiddleware.mjs";
import {
  createTeacher,
  getAllTeachers,
  getTeacherById,
  updateTeacher,
  deactivateTeacher,
} from "../controllers/teacherController.mjs";
import {
  getTeacherClasses,
  getClassStudents,
  getTeacherClassWithStudents,
} from "../controllers/classController.mjs";
import { getStudentsByClass } from "../controllers/studentController.mjs";

const router = express.Router();
// ========== TEACHER ROUTES ==========
// These routes require TEACHER role
router.get("/classes", protect, authorize("TEACHER"), getTeacherClasses);
router.get(
  "/classes/:classId/students",
  protect,
  authorize("TEACHER"),
  getClassStudents,
);
router.get(
  "/classes/:classId/details",
  protect,
  authorize("TEACHER"),
  getTeacherClassWithStudents,
);
router.get(
  "/students/class/:classId",
  protect,
  authorize("TEACHER"),
  getStudentsByClass,
);

// ========== ADMIN ROUTES ==========
router.get("/", protect, authorize("ADMIN"), getAllTeachers);
router.get("/:id", protect, authorize("ADMIN"), getTeacherById);
router.post("/", protect, authorize("ADMIN"), createTeacher);
router.put("/:id", protect, authorize("ADMIN"), updateTeacher);
router.delete("/:id", protect, authorize("ADMIN"), deactivateTeacher);

export default router;

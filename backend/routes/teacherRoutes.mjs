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

const router = express.Router();

router.get("/", protect, authorize("ADMIN"), getAllTeachers);

router.get("/:id", protect, authorize("ADMIN"), getTeacherById);

router.post("/", protect, authorize("ADMIN"), createTeacher);

router.put("/:id", protect, authorize("ADMIN"), updateTeacher);

router.delete("/:id", protect, authorize("ADMIN"), deactivateTeacher);

export default router;

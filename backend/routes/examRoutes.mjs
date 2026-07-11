import express from "express";
import protect from "../middlewares/authMiddleware.mjs";
import authorize from "../middlewares/roleMiddleware.mjs";
import {
  createExam,
  addExamResult,
  getMyResults,
  getExamsByClass,
  getAllExams,
} from "../controllers/examController.mjs";

const router = express.Router();

// Admin routes
router.post("/", protect, authorize("ADMIN"), createExam);
router.post("/result", protect, authorize("ADMIN"), addExamResult);
router.get("/all", protect, authorize("ADMIN"), getAllExams);

// Student routes
router.get("/my-results", protect, getMyResults);

// Get exams by class
router.get("/class/:classId", protect, getExamsByClass);

export default router;

import express from "express";
import protect from "../middlewares/authMiddleware.mjs";
import authorize from "../middlewares/roleMiddleware.mjs";
import {
  createExam,
  addExamResult,
  getMyResults,
  getExamsByClass,
  getAllExams,
  checkExamResult,
} from "../controllers/examController.mjs";

const router = express.Router();

// Admin routes
router.post("/", protect, authorize("TEACHER"), createExam);
router.post("/result", protect, authorize("TEACHER"), addExamResult);
router.get("/all", protect, authorize("TEACHER"), getAllExams);

// Student routes
router.get("/my-results", protect, getMyResults);

// Get exams by class
router.get("/class/:classId", protect, getExamsByClass);
router.get("/result/check", protect, checkExamResult);

export default router;

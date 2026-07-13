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
  getEligibleStudentsForExam,
} from "../controllers/examController.mjs";

const router = express.Router();

// Student routes
router.get("/my-results", protect, getMyResults);

// Teacher routes
router.post("/", protect, authorize("TEACHER"), createExam);
router.post("/result", protect, authorize("TEACHER"), addExamResult);
router.get("/all", protect, authorize("TEACHER"), getAllExams);
router.get(
  "/:examId/eligible-students",
  protect,
  authorize("TEACHER"),
  getEligibleStudentsForExam,
);

// Get exams by class
router.get("/class/:classId", protect, getExamsByClass);
router.get("/result/check", protect, checkExamResult);

export default router;

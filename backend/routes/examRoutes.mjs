import express from "express";

import protect from "../middlewares/authMiddleware.mjs";
import authorize from "../middlewares/roleMiddleware.mjs";

import {
  createExam,
  addExamResult,
  getMyResults,
} from "../controllers/examController.mjs";

const router = express.Router();

router.post("/", protect, authorize("ADMIN"), createExam);

router.post("/result", protect, authorize("ADMIN"), addExamResult);

router.get("/my-results", protect, getMyResults);

export default router;

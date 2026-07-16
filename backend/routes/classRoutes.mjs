import express from "express";

import protect from "../middlewares/authMiddleware.mjs";
import authorize from "../middlewares/roleMiddleware.mjs";

import {
  createClass,
  getAllClasses,
  assignTeacher,
} from "../controllers/classController.mjs";

const router = express.Router();

router.get("/", protect, getAllClasses);

router.post("/", protect, authorize("ADMIN"), createClass);

router.put("/assign-teacher", protect, authorize("ADMIN"), assignTeacher);

export default router;

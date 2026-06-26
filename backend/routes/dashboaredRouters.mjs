import express from "express";

import protect from "../middlewares/authMiddleware.mjs";
import authorizeRoles from "../middlewares/roleMiddleware.mjs";

import {
  getAdminDashboard,
  getTeacherDashboard,
  getStudentDashboard,
} from "../controllers/dashboaredController.mjs";

const router = express.Router();

router.use(protect);

router.get("/admin", authorizeRoles("ADMIN"), getAdminDashboard);

router.get(
  "/teacher",
  authorizeRoles("ADVANCE_TEACHER", "FRESH_TEACHER"),
  getTeacherDashboard,
);

router.get(
  "/student",
  authorizeRoles("FRESH_STUDENT", "ADVANCED_STUDENT"),
  getStudentDashboard,
);

export default router;

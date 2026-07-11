import express from "express";
import protect from "../middlewares/authMiddleware.mjs";
import authorize from "../middlewares/roleMiddleware.mjs";
import {
  createClassChangeRequest,
  getAvailableVolunteers,
  getMyClassChangeRequest,
  approveClassChange,
  rejectClassChange,
  cancelClassChangeRequest,
  acceptVolunteerMatch,
} from "../controllers/classChangeController.mjs";

const router = express.Router();

// Student routes - allow both FRESH_STUDENT and ADVANCED_STUDENT
router.post(
  "/request",
  protect,
  authorize("FRESH_STUDENT", "ADVANCED_STUDENT"),
  createClassChangeRequest,
);

router.get(
  "/volunteers",
  protect,
  authorize("FRESH_STUDENT", "ADMIN", "ADVANCED_STUDENT"),
  getAvailableVolunteers,
);

router.get(
  "/my-request",
  protect,
  authorize("FRESH_STUDENT", "ADVANCED_STUDENT"),
  getMyClassChangeRequest,
);

router.delete(
  "/cancel",
  protect,
  authorize("FRESH_STUDENT", "ADVANCED_STUDENT"),
  cancelClassChangeRequest,
);

router.post(
  "/accept-match",
  protect,
  authorize("FRESH_STUDENT", "ADVANCED_STUDENT"),
  acceptVolunteerMatch,
);

// Admin routes
router.put("/approve/:id", protect, authorize("ADMIN"), approveClassChange);

router.put("/reject/:id", protect, authorize("ADMIN"), rejectClassChange);

export default router;

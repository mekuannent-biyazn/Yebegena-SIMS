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
  getAllRequests,
} from "../controllers/classChangeController.mjs";

const router = express.Router();

// Student routes
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
router.get("/admin/all", protect, authorize("ADMIN"), getAllRequests);

router.put(
  "/admin/approve/:id",
  protect,
  authorize("ADMIN"),
  approveClassChange,
);

router.put("/admin/reject/:id", protect, authorize("ADMIN"), rejectClassChange);

export default router;

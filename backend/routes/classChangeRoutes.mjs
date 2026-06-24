import express from "express";

import protect from "../middlewares/authMiddleware.mjs";
import authorize from "../middlewares/roleMiddleware.mjs";

import {
  createClassChangeRequest,
  getAvailableVolunteers,
  getMyClassChangeRequest,
  approveClassChange,
  rejectClassChange,
} from "../controllers/classChangeController.mjs";

const router = express.Router();

router.post(
  "/request",
  protect,
  authorize("FRESH_STUDENT"),
  createClassChangeRequest,
);

router.get(
  "/volunteers",
  protect,
  authorize("FRESH_STUDENT"),
  getAvailableVolunteers,
);

router.get(
  "/my-request",
  protect,
  authorize("FRESH_STUDENT"),
  getMyClassChangeRequest,
);

router.put("/approve/:id", protect, authorize("ADMIN"), approveClassChange);

router.put("/reject/:id", protect, authorize("ADMIN"), rejectClassChange);

export default router;

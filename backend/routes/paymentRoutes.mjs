import express from "express";

import protect from "../middlewares/authMiddleware.mjs";
import authorize from "../middlewares/roleMiddleware.mjs";

import upload from "../middlewares/uploadePaymentImage.mjs";

import {
  uploadPayment,
  getMyPayments,
  getAllPayments,
  approvePayment,
  rejectPayment,
  paymentStats,
} from "../controllers/paymentController.mjs";

const router = express.Router();

router.post("/upload", protect, upload.single("receipt"), uploadPayment);

router.get("/my-payments", protect, getMyPayments);

router.get("/", protect, authorize("ADMIN"), getAllPayments);

router.get("/stats", protect, authorize("ADMIN"), paymentStats);

router.put("/approve/:id", protect, authorize("ADMIN"), approvePayment);

router.put("/reject/:id", protect, authorize("ADMIN"), rejectPayment);

export default router;

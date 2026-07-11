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
  deletePayment,
} from "../controllers/paymentController.mjs";

const router = express.Router();

router.post("/upload", protect, upload.single("receipt"), uploadPayment);
router.get("/my-payments", protect, getMyPayments);

router.get("/", protect, authorize("ADMIN"), getAllPayments);
router.get("/stats", protect, authorize("ADMIN"), paymentStats);
router.put("/approve/:id", protect, authorize("ADMIN"), approvePayment);
router.put("/reject/:id", protect, authorize("ADMIN"), rejectPayment);
router.delete("/:id", protect, authorize("ADMIN"), deletePayment);
router.get("/test", (req, res) => {
  res.json({ success: true, message: "Payment routes are working!" });
});

export default router;

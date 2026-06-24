import express from "express";

import protect from "../middlewares/authMiddleware.mjs";

import {
  getMyNotifications,
  markAsRead,
  getUnreadCount,
} from "../controllers/notificationController.mjs";

const router = express.Router();

router.get("/", protect, getMyNotifications);

router.get("/unread-count", protect, getUnreadCount);

router.put("/read/:id", protect, markAsRead);

export default router;

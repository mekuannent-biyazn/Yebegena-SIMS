import express from "express";

import protect from "../middlewares/authMiddleware.mjs";
import authorizeRoles from "../middlewares/roleMiddleware.mjs";

import {
  getMyNotifications,
  getUnreadCount,
  readNotification,
  removeNotification,
  getAllNotifications,
} from "../controllers/notificationController.mjs";

const router = express.Router();

router.use(protect);

router.get("/", getMyNotifications);

router.get("/unread-count", getUnreadCount);

router.put("/:id/read", readNotification);

router.delete("/:id", removeNotification);

router.get("/admin/all", authorizeRoles("ADMIN"), getAllNotifications);

export default router;

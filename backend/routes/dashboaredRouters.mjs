import express, { Router } from "express";

import getAdminDashboard from "../controllers/dashboaredController.mjs";
import protect from "../middlewares/authMiddleware.mjs";
import authorize from "../middlewares/roleMiddleware.mjs";

const router = express.Router();

router.get("/admin", protect, authorize("ADMIN"), getAdminDashboard);

export default router;

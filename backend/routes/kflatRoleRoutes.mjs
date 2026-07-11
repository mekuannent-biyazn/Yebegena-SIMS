import express from "express";

import protect from "../middlewares/authMiddleware.mjs";
import authorize from "../middlewares/roleMiddleware.mjs";

import {
  createKflatRole,
  getAllKflatRoles,
  getSingleKflatRole,
  updateKflatRole,
  deleteKflatRole,
} from "../controllers/kflatRoleController.mjs";

const router = express.Router();

router.get("/", getAllKflatRoles);

router.get("/:id", protect, getSingleKflatRole);

router.post("/", protect, authorize("ADMIN"), createKflatRole);

router.put("/:id", protect, authorize("ADMIN"), updateKflatRole);

router.delete("/:id", protect, authorize("ADMIN"), deleteKflatRole);

export default router;

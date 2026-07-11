import express from "express";

import protect from "../middlewares/authMiddleware.mjs";
import authorize from "../middlewares/roleMiddleware.mjs";

import {
  createKflat,
  getAllKflats,
  getSingleKflat,
  updateKflat,
  deleteKflat,
} from "../controllers/kflatController.mjs";

const router = express.Router();

router.get("/", getAllKflats);

router.get("/:id", protect, getSingleKflat);

router.post("/", protect, authorize("ADMIN"), createKflat);

router.put("/:id", protect, authorize("ADMIN"), updateKflat);

router.delete("/:id", protect, authorize("ADMIN"), deleteKflat);

export default router;

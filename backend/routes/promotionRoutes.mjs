import express from "express";

import protect from "../middlewares/authMiddleware.mjs";

import authorize from "../middlewares/roleMiddleware.mjs";

import { promoteStudentController } from "../controllers/promotionController.mjs";

const router = express.Router();

router.put(
  "/:studentId",
  protect,
  authorize("ADMIN"),
  promoteStudentController,
);

export default router;

import express from "express";
import { authMiddleware } from "../middlewares/auth.js";
import {
  upsertFeeConfig,
  getFeeConfig,
} from "../controllers/feeConfigController.js";

const router = express.Router();

// ADMIN cấu hình phí
router.post("/", authMiddleware, upsertFeeConfig);
router.get("/", authMiddleware, getFeeConfig);

export default router;

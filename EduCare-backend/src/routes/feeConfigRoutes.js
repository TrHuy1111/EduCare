import express from "express";
import { authMiddleware } from "../middlewares/auth.js";
import {
  upsertFeeConfig,
  getFeeConfig,
} from "../controllers/feeConfigController.js";
import { checkRole } from "../middlewares/checkRole.js";
const router = express.Router();

// ADMIN cấu hình phí
router.post("/", authMiddleware, checkRole(["admin"]), upsertFeeConfig);
router.get("/", authMiddleware, checkRole(["admin"]), getFeeConfig);

export default router;

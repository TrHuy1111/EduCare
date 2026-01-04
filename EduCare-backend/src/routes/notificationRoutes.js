import express from "express";
import { getMyNotifications, markAsRead } from "../controllers/notificationController.js";
import { verifyFirebaseToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", verifyFirebaseToken, getMyNotifications);
router.put("/:id/read", verifyFirebaseToken, markAsRead);

export default router;
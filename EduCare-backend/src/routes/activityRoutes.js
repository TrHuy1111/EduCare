import express from "express";
import { getActivitiesByClassAndDate, saveActivities } from "../controllers/activityController.js";
import { authMiddleware } from "../middlewares/auth.js";
const router = express.Router();

router.get("/:classId/:date", authMiddleware,getActivitiesByClassAndDate);
router.post("/save", authMiddleware , saveActivities);

export default router;
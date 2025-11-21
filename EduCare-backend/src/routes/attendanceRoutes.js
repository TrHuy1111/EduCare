///routes/attendanceRoutes.js
import express from "express";
import { authMiddleware } from "../middlewares/auth.js";
import {
  getTeacherClasses,
  getStudentsByClass,
  saveAttendance,
  getAttendance,
} from "../controllers/attendanceController.js";

const router = express.Router();

// 🔥 Teacher routes (requires login)
router.get("/classes", authMiddleware, getTeacherClasses);
router.get("/students/:classId", authMiddleware, getStudentsByClass);
router.post("/", authMiddleware, saveAttendance);
router.get("/", authMiddleware, getAttendance);

export default router;

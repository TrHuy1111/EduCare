///routes/attendanceRoutes.js
import express from "express";
import { authMiddleware } from "../middlewares/auth.js";
import {
  getTeacherClasses,
  getStudentsByClass,
  saveAttendance,
  getAttendance,
  getAttendanceHistory,
  getAttendanceStats
} from "../controllers/attendanceController.js";
import { checkRole } from "../middlewares/checkRole.js";

const router = express.Router();

// 🔥 Teacher routes (requires login)
router.get("/classes", authMiddleware, checkRole(["teacher"]),getTeacherClasses);
router.get("/students/:classId", authMiddleware, checkRole(["teacher"]),getStudentsByClass);
router.post("/", authMiddleware, checkRole(["teacher"]),saveAttendance);
router.get("/", authMiddleware, checkRole(["teacher"]),getAttendance);
router.get("/history", authMiddleware,checkRole(["teacher"]),getAttendanceHistory);
router.get("/stats", authMiddleware,checkRole(["teacher"]),getAttendanceStats);
export default router;

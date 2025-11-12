import express from "express";
import {
  createClass,
  getAllClasses,
  assignTeacherToClass,
  enrollStudentToClass,
  updateClass,
} from "../controllers/classController.js";

import { verifyFirebaseToken } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/checkRole.js";

const router = express.Router();

// 🏫 CRUD lớp học
router.post("/", verifyFirebaseToken, checkRole(["admin"]), createClass);
router.get("/", verifyFirebaseToken, checkRole(["admin", "teacher"]), getAllClasses);
router.put("/:classId", verifyFirebaseToken, checkRole(["admin"]), updateClass);

// 🧑‍🏫 Gán giáo viên & học sinh vào lớp
router.post("/assign-teacher", verifyFirebaseToken, checkRole(["admin"]), assignTeacherToClass);
router.post("/enroll-student", verifyFirebaseToken, checkRole(["admin"]), enrollStudentToClass);

export default router;

// routes/classRoutes.js
import express from "express";
import {
  createClass,
  getAllClasses,
  assignTeacherToClass,
  enrollStudentToClass,
  updateClass,
  deleteClass,
  getClassesForTeacher,
  removeTeacherFromClass,
} from "../controllers/classController.js";

import { verifyFirebaseToken } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/checkRole.js";

const router = express.Router();

// 🏫 CRUD lớp học
router.post("/", verifyFirebaseToken, checkRole(["admin"]), createClass);
router.get("/", verifyFirebaseToken, checkRole(["admin", "teacher"]), getAllClasses);
router.put("/:classId", verifyFirebaseToken, checkRole(["admin"]), updateClass);
router.delete("/:classId", verifyFirebaseToken, checkRole(["admin"]), deleteClass);
// 🧑‍🏫 Gán giáo viên & học sinh vào lớp
router.post("/assign-teacher", verifyFirebaseToken, checkRole(["admin"]), assignTeacherToClass);
router.post("/enroll-student", verifyFirebaseToken, checkRole(["admin"]), enrollStudentToClass);
// xoa teacher khoi lop
router.post("/remove-teacher", verifyFirebaseToken, checkRole(["admin"]), removeTeacherFromClass);
// 🧑‍🏫 Lấy lớp học của giáo viên
router.get("/my-classes", verifyFirebaseToken, checkRole(["teacher"]), getClassesForTeacher);
export default router;

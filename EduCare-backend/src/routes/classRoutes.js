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
  updateClassCamera,
  getClassCamera,
  removeStudentFromClass,
  getClassDetailForParent
} from "../controllers/classController.js";

import { verifyFirebaseToken } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/checkRole.js";
import { uploadCamera } from "../middlewares/uploadCamera.js";
import { authMiddleware } from "../middlewares/auth.js";
const router = express.Router();

// 🏫 CRUD lớp học
router.post("/", authMiddleware, checkRole(["admin"]), createClass);
router.get("/", authMiddleware, checkRole(["admin", "teacher"]), getAllClasses);
router.put("/:classId", authMiddleware, checkRole(["admin"]), updateClass);
router.delete("/:classId", authMiddleware, checkRole(["admin"]), deleteClass);
// 🧑‍🏫 Gán giáo viên & học sinh vào lớp
router.post("/assign-teacher", authMiddleware, checkRole(["admin"]), assignTeacherToClass);
router.post("/enroll-student", authMiddleware, checkRole(["admin"]), enrollStudentToClass);
router.post("/remove-student", authMiddleware, checkRole(["admin"]), removeStudentFromClass);
// xoa teacher khoi lop
router.post("/remove-teacher", authMiddleware, checkRole(["admin"]), removeTeacherFromClass);
// 🧑‍🏫 Lấy lớp học của giáo viên
router.get("/my-classes", authMiddleware, checkRole(["teacher"]), getClassesForTeacher);

router.put("/:id/camera", authMiddleware, checkRole(["admin"]), uploadCamera.single("camera"), updateClassCamera);
router.get("/:id/camera", authMiddleware, checkRole(["parent"]),  getClassCamera);

router.get("/:id/detail", authMiddleware, checkRole(["parent"]), getClassDetailForParent);
export default router;

import express from 'express';
import {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getMyChildren,
  getStudentsForEnrollment
} from '../controllers/studentController.js';
import { verifyFirebaseToken } from '../middlewares/authMiddleware.js';
import { checkRole } from '../middlewares/checkRole.js';
import { authMiddleware } from "../middlewares/auth.js";
const router = express.Router();

// 🟢 Tạo học sinh (Admin)
router.post('/', authMiddleware, checkRole(['admin']), createStudent);

// 🟢 Lấy toàn bộ học sinh (Admin, Teacher)
router.get('/', authMiddleware, checkRole(['admin', 'teacher','parent']), getAllStudents);

// 🟢 Lấy con của phụ huynh (Parent)
router.get('/my-children', authMiddleware, checkRole(['parent']), getMyChildren);

router.get('/waiting-enrollment', authMiddleware, checkRole(['admin']), getStudentsForEnrollment);

// 🟢 Lấy 1 học sinh theo ID
router.get('/:id', authMiddleware, checkRole(['admin', 'teacher','parent']), getStudentById);


// 🟡 Cập nhật học sinh (Admin)
router.put('/:id', authMiddleware, checkRole(['admin']), updateStudent);

// 🔴 Xóa học sinh (Admin)
router.delete('/:id', authMiddleware, checkRole(['admin']), deleteStudent);

export default router;

import express from 'express';
import {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getMyChildren
} from '../controllers/studentController.js';
import { verifyFirebaseToken } from '../middlewares/authMiddleware.js';
import { checkRole } from '../middlewares/checkRole.js';

const router = express.Router();

// 🟢 Tạo học sinh (Admin)
router.post('/', verifyFirebaseToken, checkRole(['admin']), createStudent);

// 🟢 Lấy toàn bộ học sinh (Admin, Teacher)
router.get('/', verifyFirebaseToken, checkRole(['admin', 'teacher','parent']), getAllStudents);

// 🟢 Lấy con của phụ huynh (Parent)
router.get('/my-children', verifyFirebaseToken, checkRole(['parent']), getMyChildren);

// 🟢 Lấy 1 học sinh theo ID
router.get('/:id', verifyFirebaseToken, checkRole(['admin', 'teacher','parent']), getStudentById);

// 🟡 Cập nhật học sinh (Admin)
router.put('/:id', verifyFirebaseToken, checkRole(['admin']), updateStudent);

// 🔴 Xóa học sinh (Admin)
router.delete('/:id', verifyFirebaseToken, checkRole(['admin']), deleteStudent);


export default router;

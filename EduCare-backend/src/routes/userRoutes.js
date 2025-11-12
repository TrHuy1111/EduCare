import express from 'express';
import { createOrUpdateUser, loginOrRegister,syncUser, updateUserRole,toggleUserStatus,getAllUsers,getTeachers } from '../controllers/userController.js';
import { verifyFirebaseToken } from '../middlewares/authMiddleware.js';
import { authMiddleware,isAdmin } from '../middlewares/auth.js';

const router = express.Router();
// GET /api/user/ -> verify token, then get all users (admin only)
router.get('/', verifyFirebaseToken, getAllUsers);

router.post('/', createOrUpdateUser);
router.post('/login', verifyFirebaseToken,loginOrRegister);  

// POST /api/user/sync -> verify token, then create/update user
router.post('/sync', verifyFirebaseToken, syncUser);
//Role update only admin can do
router.put('/role', authMiddleware, isAdmin, updateUserRole);
//Toggle user status (active/inactive) - only admin
router.put('/status', verifyFirebaseToken, toggleUserStatus);
// GET /api/user/teachers -> get all teachers
router.get('/teachers', verifyFirebaseToken, getTeachers);
export default router;

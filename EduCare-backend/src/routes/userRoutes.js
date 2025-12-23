// userRoutes.js
import express from 'express';
import { createOrUpdateUser, loginOrRegister,syncUser, updateUserRole,toggleUserStatus,getAllUsers,getTeachers, getParents, updateUserProfile } from '../controllers/userController.js';
import { verifyFirebaseToken } from '../middlewares/authMiddleware.js';
import { authMiddleware,isAdmin } from '../middlewares/auth.js';
import { getCurrentUser, getUserProfile } from "../controllers/userController.js";
import uploadUserAvatar from "../middlewares/uploadUser.js";
const router = express.Router();
// GET /api/user/ -> verify token, then get all users (admin only)
router.get('/', verifyFirebaseToken, getAllUsers);

router.post('/', createOrUpdateUser);
router.post('/login', verifyFirebaseToken,loginOrRegister);  
//Get current user role 
router.get('/me', verifyFirebaseToken, getCurrentUser);

router.get('/current', authMiddleware, getUserProfile);
// POST /api/user/sync -> verify token, then create/update user
router.post('/sync', verifyFirebaseToken, syncUser);
//Role update only admin can do
router.put('/role', authMiddleware, isAdmin, updateUserRole);
//Toggle user status (active/inactive) - only admin
router.put('/status', verifyFirebaseToken, toggleUserStatus);
// GET /api/user/teachers -> get all teachers
router.get('/teachers', verifyFirebaseToken, getTeachers);
// GET /api/user/parents -> get all parents
router.get('/parents', verifyFirebaseToken, getParents);

router.put('/profile', verifyFirebaseToken, uploadUserAvatar.single('image'), updateUserProfile);
export default router;

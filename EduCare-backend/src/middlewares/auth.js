// auth.js
import admin from '../firebaseAdmin.js';
import User from '../models/User.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token, unauthorized' });

    const decoded = await admin.auth().verifyIdToken(token);

    const userInDB = await User.findOne({ uid: decoded.uid });
    if (!userInDB) return res.status(404).json({ message: 'User not found in DB' });

    req.user = userInDB;     
    req.user.role = userInDB.role;

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token', error });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admin only' });
  }
  next();
};

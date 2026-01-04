import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import classRoutes from './routes/classRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import tuitionRoutes from './routes/tuitionRoutes.js';
import feeConfigRoutes from './routes/feeConfigRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import notificationRoutes from "./routes/notificationRoutes.js";
import path from 'path';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get('/', (req, res) => res.send('API is running...'));

app.use('/api/class', classRoutes);

app.use('/api/user', userRoutes); 

app.use('/api/student', studentRoutes);

app.use("/api/attendance", attendanceRoutes);

app.use("/api/activities", activityRoutes);

app.use("/api/announcements", announcementRoutes);

app.use("/api/tuition", tuitionRoutes);

app.use("/api/notifications", notificationRoutes);

app.use("/api/fee-config", feeConfigRoutes);

app.use("/api/feedback", feedbackRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

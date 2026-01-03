import express from "express";
import {
  createOrUpdateFeedback,
  getFeedbackByStudent,
  getFeedbackByClassAndDate,
  getFeedbackDetail,
  getFeedbackStats,
  getTeacherRewardStats
} from "../controllers/feedbackController.js";

import { verifyFirebaseToken } from "../middlewares/authMiddleware.js";
import { checkRole } from "../middlewares/checkRole.js";

const router = express.Router();

// 🧑‍🏫 Teacher tạo / sửa feedback
router.post(
  "/",
  verifyFirebaseToken,
  checkRole(["teacher"]),
  createOrUpdateFeedback
);

// 👨‍👩‍👧 Parent xem feedback của con
router.get(
  "/student/:studentId",
  verifyFirebaseToken,
  checkRole(["parent"]),
  getFeedbackByStudent
);

// 🧑‍🏫 Teacher xem feedback theo lớp + ngày
router.get(
  "/",
  verifyFirebaseToken,
  checkRole(["teacher"]),
  getFeedbackByClassAndDate
);

// GET /api/feedback/detail
router.get(
  "/detail",
  verifyFirebaseToken,
  checkRole(["teacher"]),
  getFeedbackDetail
);

router.get(
  "/stats",
  verifyFirebaseToken,
  checkRole(["teacher"]),
  getFeedbackStats
);
export default router;

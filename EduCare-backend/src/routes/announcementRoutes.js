// EduCare-backend/src/routes/announcementRoutes.js
import express from "express";
import {
  createAnnouncement,
  getUpcomingAnnouncements,
  getAllAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  toggleLikeAnnouncement,
} from "../controllers/announcementController.js";
import { verifyFirebaseToken } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.get("/upcoming", getUpcomingAnnouncements);

router.post("/", verifyFirebaseToken, upload.single("image"), createAnnouncement);
router.get("/", getAllAnnouncements);
router.get("/:id", getAnnouncementById);
router.put("/:id", verifyFirebaseToken, upload.single("image"), updateAnnouncement);
router.delete("/:id",verifyFirebaseToken, deleteAnnouncement);

router.post(
  "/:id/like",
  verifyFirebaseToken,
  toggleLikeAnnouncement
);

export default router;

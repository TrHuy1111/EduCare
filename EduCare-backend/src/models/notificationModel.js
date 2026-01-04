import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ["tuition", "announcement", "system"], default: "system" },
    isRead: { type: Boolean, default: false }, 
    relatedId: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
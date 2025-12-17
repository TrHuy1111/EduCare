import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true }, // mô tả chi tiết
    image: { type: String }, // URL hoặc base64

    location: { type: String },   
    startTime: { type: Date },     
    endTime: { type: Date },       

    likes: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Announcement", announcementSchema);

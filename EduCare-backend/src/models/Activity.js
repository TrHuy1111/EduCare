import mongoose from "mongoose";

const activityItemSchema = new mongoose.Schema({
  startTime: { type: String, required: true }, // "08:00"
  endTime: { type: String, required: true },   // "09:00"
  title: { type: String, required: true },     // "Breakfast Time"
  location: { type: String, required: true },  // "Dining Room"
  order: { type: Number, default: 0 },         // để sort
});

const activitySchema = new mongoose.Schema(
  {
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    date: { type: String, required: true }, // "2025-11-12"
    activities: [activityItemSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Activity", activitySchema);
// models/Feedback.js
import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    // 👇 Activity document (theo ngày)
    activityDateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Activity",
      required: true,
    },

    // 👇 Activity con trong activities[]
    activityItemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: String,
      required: true,
    },

    comment: {
      type: String,
      default: "",
    },

    reward: {
      type: String,
      enum: ["none", "star", "flower", "badge"],
      default: "none",
    },
  },
  { timestamps: true }
);

/**
 * ⭐ Mỗi học sinh – mỗi activity con – mỗi ngày chỉ 1 feedback
 */
feedbackSchema.index(
  { studentId: 1, activityItemId: 1, date: 1 },
  { unique: true }
);

export default mongoose.model("Feedback", feedbackSchema);

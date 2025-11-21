import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    takenBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    records: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
        session: { type: String, enum: ["morning", "afternoon"], required: true },
        status: { type: String, enum: ["present", "absent", "late", "left-early"], required: true },
        note: { type: String },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance;

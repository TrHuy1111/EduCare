// EduCare-backend/src/models/classModel.js
import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, 
    level: {
      type: String,
      enum: ["infant", "toddler", "preK2", "preK3", "preK4", "preK5"],
      required: true,
    },
    description: { type: String },
    tuitionFee: { type: Number, required: true },

    // 🔗 Danh sách học sinh
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],

    // 🔗 Danh sách giáo viên phụ trách
    teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // 👩‍🏫 Giáo viên chủ nhiệm
    homeroomTeacher: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // ⚠️ RULE CHO MỖI LỚP
    minStudents: { type: Number, required: true },
    maxStudents: { type: Number, required: true },
    minTeachers: { type: Number, required: true },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Class = mongoose.model("Class", classSchema);
export default Class;

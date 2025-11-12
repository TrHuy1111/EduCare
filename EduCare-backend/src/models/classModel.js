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

    // 🔗 Danh sách học sinh
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],

    // 🔗 Danh sách giáo viên phụ trách
    teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // 👩‍🏫 Giáo viên chủ nhiệm
    homeroomTeacher: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Class = mongoose.model("Class", classSchema);
export default Class;

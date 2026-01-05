// EduCare-backend/src/models/studentModel.js
import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    // 🧍‍♂️ Thông tin cơ bản
    name: { type: String, required: true },
    address: { type: String },
    dob: { type: Date },
    gender: { type: String, enum: ['male', 'female'] },
    avatar: { type: String }, // link ảnh từ gallery / storage

    joinedDate: { type: Date, required: true },
    endDate: {
      type: Date,
      default: null // null = vẫn đang học
    },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    targetLevel: { 
      type: String, 
      enum: ["infant", "toddler", "preK2", "preK3", "preK4", "preK5"],
      required: true 
    },
    isTrial: { type: Boolean, default: false },
    // 📏 Sức khỏe
    height: { type: Number }, // cm
    weight: { type: Number }, // kg

    // 👨‍👩‍👧 Thông tin cha mẹ
    fatherName: { type: String },
    fatherPhone: { type: String },
    motherName: { type: String },
    motherPhone: { type: String },
    medicalNote: { type: String },
    allergies: { type: [String], default: [] },

    // 🔗 Liên kết lớp học
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class",default: null },

    // 🔗 Liên kết phụ huynh
    parents: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" , required: true}],
  },
  
  { timestamps: true }
);

const Student = mongoose.model('Student', studentSchema);
export default Student;
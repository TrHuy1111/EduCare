import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    // 🧍‍♂️ Thông tin cơ bản
    name: { type: String, required: true },
    address: { type: String },
    dob: { type: Date },
    gender: { type: String, enum: ['male', 'female'] },
    avatar: { type: String }, // link ảnh từ gallery / storage

    // 📏 Sức khỏe
    height: { type: Number }, // cm
    weight: { type: Number }, // kg

    // 👨‍👩‍👧 Thông tin cha mẹ
    fatherName: { type: String },
    fatherPhone: { type: String },
    motherName: { type: String },
    motherPhone: { type: String },

     // 👩‍🏫 Liên kết giáo viên chủ nhiệm
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // 🔗 Liên kết lớp học
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },

    // 🔗 Liên kết phụ huynh
    parents: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const Student = mongoose.model('Student', studentSchema);
export default Student;
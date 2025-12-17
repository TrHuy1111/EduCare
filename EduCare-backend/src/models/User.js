// src/models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  name: { type: String },
  email: { type: String, required: false},
  phone: { type: String },
  role: { type: String, enum: ['parent','teacher','admin'], default: 'parent' },
  isActive: { type: Boolean, default: true }, // ✅ trạng thái hoạt động
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
  children: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
  
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;

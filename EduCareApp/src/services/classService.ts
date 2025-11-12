// src/services/classService.ts
import axios from "axios";
import auth from "@react-native-firebase/auth";

const API_URL = "http://192.168.118.1:5000/api/class"; // ⚠️ Đổi IP theo backend của bạn

// 🟢 Helper: Lấy Firebase token để xác thực
const getAuthHeader = async () => {
  const user = auth().currentUser;
  if (!user) throw new Error("User not logged in");
  const idToken = await user.getIdToken(true);
  return {
    headers: { Authorization: `Bearer ${idToken}` },
  };
};

// 🏫 Lấy tất cả lớp
export const getAllClasses = async () => {
  const config = await getAuthHeader();
  return axios.get(API_URL, config);
};

// 📄 Lấy chi tiết 1 lớp theo ID
export const getClassById = async (classId: string) => {
  const config = await getAuthHeader();
  return axios.get(`${API_URL}/${classId}`, config);
};

// ➕ Tạo lớp mới
export const createClass = async (data: {
  name: string;
  level: string;
  description?: string;
}) => {
  const config = await getAuthHeader();
  // ❌ return axios.post(`${API_URL}/create`, data, config);
  // ✅ Gọi đúng endpoint backend đang dùng:
  return axios.post(API_URL, data, config);
};

// 👩‍🏫 Gán giáo viên vào lớp
export const assignTeacherToClass = async (
  classId: string,
  teacherId: string
) => {
  const config = await getAuthHeader();
  return axios.post(`${API_URL}/assign-teacher`, { classId, teacherId }, config);
};

// 🧑‍🎓 Gán học sinh vào lớp (nếu backend có hỗ trợ)
export const enrollStudentToClass = async (
  classId: string,
  studentId: string
) => {
  const config = await getAuthHeader();
  return axios.post(`${API_URL}/enroll-student`, { classId, studentId }, config);
};

// 🗑️ Xóa lớp học
export const deleteClass = async (classId: string) => {
  const config = await getAuthHeader();
  return axios.delete(`${API_URL}/${classId}`, config);
};

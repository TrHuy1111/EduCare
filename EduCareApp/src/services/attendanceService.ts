// src/services/attendanceService.ts
import axios from "axios";
import auth from "@react-native-firebase/auth";

const API_URL = "http://192.168.118.1:5000/api/attendance"; // đổi IP nếu cần

// 🟢 Hàm lấy token Firebase
const getAuthHeader = async () => {
  const user = auth().currentUser;
  if (!user) throw new Error("User not logged in");
  const idToken = await user.getIdToken(true);

  return {
    headers: { Authorization: `Bearer ${idToken}` },
  };
};

// -----------------------------------------
// 🟩 1. Lấy danh sách lớp của giáo viên
// GET /api/attendance/classes
// -----------------------------------------
export const getTeacherClasses = async () => {
  const config = await getAuthHeader();
  return axios.get(`${API_URL}/classes`, config);
};

// -----------------------------------------
// 🟩 2. Lấy học sinh theo class
// GET /api/attendance/students/:classId
// -----------------------------------------
export const getStudentsByClass = async (classId: string) => {
  const config = await getAuthHeader();
  return axios.get(`${API_URL}/students/${classId}`, config);
};

// -----------------------------------------
// 🟩 3. Lấy bảng điểm danh theo ngày
// getAttendance expects query params: ?classId=xxx&date=YYYY-MM-DD
export const getAttendance = async (classId: string, date: string) => {
  const config = await getAuthHeader();
  return axios.get(`${API_URL}?classId=${classId}&date=${date}`, config);
};

// save attendance: payload { classId, date, records: [{ student, session, status, note? }] }
export const saveAttendance = async (payload: {
  classId: string;
  date: string;
  records: Array<{ student: string; session: "morning" | "afternoon"; status: string; note?: string }>;
}) => {
  const config = await getAuthHeader();
  return axios.post(`${API_URL}`, payload, config);
};
// src/services/attendanceService.ts
import axios from "axios";
import auth from "@react-native-firebase/auth";
import { API_BASE_URL } from '@env';

const API_URL = `${API_BASE_URL}/attendance`; 

// Hàm lấy token Firebase
const getAuthHeader = async () => {
  const user = auth().currentUser;
  if (!user) throw new Error("User not logged in");
  const idToken = await user.getIdToken(true);

  return {
    headers: { Authorization: `Bearer ${idToken}` },
  };
};
// Lay ds gvien theo lop
export const getTeacherClasses = async () => {
  const config = await getAuthHeader();
  return axios.get(`${API_URL}/classes`, config);
};

// Lay ds tre theo lop
export const getStudentsByClass = async (classId: string) => {
  const config = await getAuthHeader();
  return axios.get(`${API_URL}/students/${classId}`, config);
};


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
// Lấy lịch sử điểm danh theo ngày
export const getAttendanceHistory = async (classId: string) => {
  const config = await getAuthHeader();
  return axios.get(`${API_URL}/history?classId=${classId}`, config);
};
//  Lấy thống kê điểm danh theo tháng
export const getAttendanceStats = async (
  classId: string,
  month: number,
  year: number
) => {
  const config = await getAuthHeader();
  return axios.get(
    `${API_URL}/stats?classId=${classId}&month=${month}&year=${year}`,
    config
  );
};
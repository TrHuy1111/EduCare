import axios from "axios";
import auth from "@react-native-firebase/auth";
import { API_BASE_URL } from '@env';

const API_URL = `${API_BASE_URL}/feedback`;

// 🔐 Auth header
const getAuthHeader = async () => {
  const user = auth().currentUser;
  if (!user) throw new Error("User not logged in");

  const token = await user.getIdToken(true);
  return {
    headers: { Authorization: `Bearer ${token}` },
  };
};

// 🧑‍🏫 Teacher tạo / cập nhật feedback
export const saveFeedback = async (payload: {
  studentId: string;
  classId: string;
  activityDateId: string;
  activityItemId: string;
  date: string;
  comment: string;
  reward: "none" | "star" | "flower" | "badge";
}) => {
  const config = await getAuthHeader();
  return axios.post(API_URL, payload, config);
};

// 👨‍👩‍👧 Parent xem feedback của con
export const getFeedbackByStudent = async (studentId: string) => {
  const config = await getAuthHeader();
  return axios.get(`${API_URL}/student/${studentId}`, config);
};

// 🧑‍🏫 Teacher xem feedback theo lớp + ngày
export const getFeedbackByClassAndDate = async (
  classId: string,
  date: string
) => {
  const config = await getAuthHeader();
  return axios.get(`${API_URL}?classId=${classId}&date=${date}`, config);
};

export const getFeedbackDetail = async (params: {
  studentId: string;
  activityItemId: string;
  date: string;
}) => {
  const config = await getAuthHeader();
  return axios.get(
    `${API_URL}/detail?studentId=${params.studentId}&activityItemId=${params.activityItemId}&date=${params.date}`,
    config
  );
};

export const getFeedbackStats = async (params: {
  classId: string;
  from: string;
  to: string;
}) => {
  const config = await getAuthHeader();
  return axios.get(
    `${API_URL}/stats?classId=${params.classId}&from=${params.from}&to=${params.to}`,
    config
  );
};

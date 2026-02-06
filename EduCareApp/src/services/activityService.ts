// EduCareApp/src/services/activityService.ts
import axios from "axios";
import auth from "@react-native-firebase/auth";
import { API_BASE_URL } from '@env';

const API_URL = `${API_BASE_URL}/activities`;

//  Firebase Auth Header
const getAuthHeader = async () => {
  const user = auth().currentUser;
  if (!user) throw new Error("User not logged in");
  const idToken = await user.getIdToken(true);
  return { headers: { Authorization: `Bearer ${idToken}` } };
};

// Lấy activities của 1 lớp theo ngày
export const getActivities = async (classId: string, date: string) => {
  const config = await getAuthHeader();
  return axios.get(`${API_URL}/${classId}/${date}`, config);
};

//  Lưu activities
export const saveActivities = async (payload: {
  classId: string;
  date: string;
  activities: any[];
}) => {
  const config = await getAuthHeader();
  return axios.post(`${API_URL}/save`, payload, config);
};

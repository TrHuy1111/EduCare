import axios from "axios";
import auth from "@react-native-firebase/auth";
import { API_BASE_URL } from '@env';

const API_URL = `${API_BASE_URL}/notifications`;

const getAuthHeader = async () => {
  const user = auth().currentUser;
  if (!user) throw new Error("Not logged in");
  const token = await user.getIdToken(true);
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const getNotifications = async () => {
  const config = await getAuthHeader();
  return axios.get(API_URL, config);
};

export const markNotificationRead = async (id: string) => {
  const config = await getAuthHeader();
  return axios.put(`${API_URL}/${id}/read`, {}, config);
};
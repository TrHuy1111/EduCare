import axios from "axios";
import auth from "@react-native-firebase/auth";

const API_URL = "http://192.168.118.1:5000/api/notifications";

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
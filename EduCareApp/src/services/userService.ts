//src/services/userService.ts
import axios from 'axios';
import auth from '@react-native-firebase/auth';

const API_URL = 'http://192.168.118.1:5000/api/user';
export const BASE_URL = "http://192.168.118.1:5000"; // for image paths

export const syncUserToBackend = async () => {
  try {
    const user = auth().currentUser;
    if (!user) throw new Error("No Firebase user found");

    const idToken = await user.getIdToken(true);
    console.log('🔥 Your Firebase ID Token:', idToken);
    const res = await axios.post(
      `${API_URL}/login`,
      {},
      { headers: { Authorization: `Bearer ${idToken}` } }
    );

    console.log("✅ Synced user:", res.data.user);
    return res.data.user; // 👈 trả về thông tin user từ backend
  } catch (err: any) {
    console.error("❌ syncUserToBackend error:", err.response?.data || err.message);
    throw err;
  }
};

const getToken = async () => {
  const currentUser = auth().currentUser;
  if (!currentUser) throw new Error('No user logged in');
  return await currentUser.getIdToken();
};

export const fetchAllUsers = async () => {
  const token = await getToken();
  console.log("🔑 Firebase Token:", token.substring(0, 30) + "..."); // log token
  try {
    const res = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("✅ fetchAllUsers result:", res.data);
    return res;
  } catch (err: any) {
    console.error("❌ fetchAllUsers error:", err.response?.status, err.response?.data || err.message);
    throw err;
  }
};

export const updateUserRole = async (userId: string, newRole: string) => {
  const token = await getToken();
  return axios.put(
    `${API_URL}/role`,
    { userId, newRole },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

export const toggleUserStatus = async (userId: string, isActive: boolean) => {
  const token = await getToken();
  return axios.put(
    `${API_URL}/status`,
    { userId, isActive },
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

export const fetchTeachers = async () => {
  const token = await getToken();
  const res = await axios.get(`${API_URL}/teachers`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const logout = async (navigation: any) => {
  await auth().signOut();
  navigation.reset({ index: 0, routes: [{ name: "Auth" }] });
};

export const getCurrentUserRole = async () => {
  const token = await getToken();
  const res = await axios.get(`${API_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.role;
};

export const fetchParents = async () => {
  const token = await getToken();
  const res = await axios.get(`${API_URL}/parents`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getUserProfile = async () => {
  const token = await getToken();
  const res = await axios.get(`${API_URL}/current`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.user;
};

export const updateUserProfile = async (formData: FormData) => {
  const token = await getToken();
  return axios.put(`${API_URL}/profile`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
};




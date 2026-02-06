//src/services/userService.ts
import axios from 'axios';
import auth from '@react-native-firebase/auth';
import { API_BASE_URL , SERVER_URL} from '@env';

const API_URL = `${API_BASE_URL}/user`;
export const BASE_URL = SERVER_URL;

export const syncUserToBackend = async (userData?: { name?: string; phone?: string }) => {
  try {
    const user = auth().currentUser;
    if (!user) throw new Error("No Firebase user found");
    
    await user.reload();

    const idToken = await user.getIdToken(true);
    
    // 👇 Gửi kèm userData vào body (nếu có)
    const res = await axios.post(
      `${API_URL}/login`,
      { 
        ...userData // Merge dữ liệu name, phone vào body
      }, 
      { headers: { Authorization: `Bearer ${idToken}` } }
    );

    console.log("✅ Synced user:", res.data.user);
    return res.data.user; 
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

export const fetchAllUsers = async (search: string = "") => {
  const token = await getToken();
  console.log("🔑 Firebase Token:", token.substring(0, 30) + "..."); // log token
  return axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
    params: { search },
  });
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




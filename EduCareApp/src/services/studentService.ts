// EduCareApp/src/services/studentService.ts
import axios from 'axios';
import auth from '@react-native-firebase/auth';

const API_URL = 'http://192.168.118.1:5000/api/student'; // Đổi IP tùy máy

// 🟢 Hàm helper lấy token Firebase
const getAuthHeader = async () => {
  const user = auth().currentUser;
  if (!user) throw new Error('User not logged in');
  const idToken = await user.getIdToken(true);
  return {
    headers: { Authorization: `Bearer ${idToken}` },
  };
};

// 🧩 CRUD API
export const createStudent = async (data: any) => {
  const config = await getAuthHeader();
  return axios.post(API_URL, data, config);
};

export const getAllStudents = async () => {
  const config = await getAuthHeader();
  return axios.get(API_URL, config);
};

export const getStudentById = async (id: string) => {
  const config = await getAuthHeader();
  return axios.get(`${API_URL}/${id}`, config);
};

export const updateStudent = async (id: string, data: any) => {
  const config = await getAuthHeader();
  return axios.put(`${API_URL}/${id}`, data, config);
};

export const deleteStudent = async (id: string) => {
  const config = await getAuthHeader();
  return axios.delete(`${API_URL}/${id}`, config);
};

// 🟢 Lấy thông tin học sinh của phụ huyn
export const getMyChildren = async () => {
  const config = await getAuthHeader();
  return axios.get(`${API_URL}/my-children`, config);
};

export const getWaitingStudents = async (level: string) => {
  const config = await getAuthHeader();
  return axios.get(`${API_URL}/waiting-enrollment?level=${level}`, config);
};
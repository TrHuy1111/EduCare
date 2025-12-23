import axios from "axios";
import auth from "@react-native-firebase/auth";

const API_URL = "http://192.168.118.1:5000/api/announcements";

export const BASE_URL = "http://192.168.118.1:5000";// for image paths

// Helper to get auth header
const getAuthHeader = async () => {
  const user = auth().currentUser;
  if (!user) throw new Error("User not logged in");
  const idToken = await user.getIdToken(true);

  return {
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "multipart/form-data",
    },
  };
};
//
const getMultipartHeader = async () => {
  const base = await getAuthHeader();
  return {
    headers: {
      ...base.headers,
      "Content-Type": "multipart/form-data",
    },
  };
};

// GET /api/announcements/upcoming
export const getUpcomingAnnouncements = async () => {
  const config = await getAuthHeader();
  return axios.get(`${API_URL}/upcoming`, config);
};

// GET /api/announcements
export const getAllAnnouncements = async () => {
  const config = await getAuthHeader();
  return axios.get(API_URL, config);
};

// GET /api/announcements/:id
export const getAnnouncementById = async (id: string) => {
  const config = await getAuthHeader();
  return axios.get(`${API_URL}/${id}`, config);
};

// POST /api/announcements/:id/like
export const toggleLikeAnnouncement = async (id: string) => {
  const config = await getAuthHeader(); 
  return axios.post(`${API_URL}/${id}/like`, null, config);
};

// POST /api/announcements
export const createAnnouncement = async (formData: FormData) => {
  const config = await getAuthHeader();
  return axios.post(API_URL, formData, config);
};

// UPDATE /api/announcements/:id
export const updateAnnouncement = async (
  id: string,
  formData: FormData
) => {
  const config = await getAuthHeader();
  return axios.put(`${API_URL}/${id}`, formData, config);
};


//DELETE /api/announcements/:id
export const deleteAnnouncement = async (id: string) => {
  const config = await getAuthHeader();
  return axios.delete(`${API_URL}/${id}`, config);
};

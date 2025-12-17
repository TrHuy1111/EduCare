// src/services/tuitionService.ts
import axios from "axios";
import auth from "@react-native-firebase/auth";

const API_URL = "http://192.168.118.1:5000/api/tuition";

const getAuthHeader = async () => {
  const user = auth().currentUser;
  if (!user) throw new Error("Not logged in");

  const token = await user.getIdToken(true);
  return {
    headers: { Authorization: `Bearer ${token}` },
  };
};

// 🔥 Generate invoice tháng
export const generateMonthlyTuition = async (
  month: number,
  year: number
) => {
  const config = await getAuthHeader();
  return axios.post(
    `${API_URL}/generate`,
    { month, year },
    config
  );
};
// 📄 Lấy invoice theo học sinh
export const getInvoicesByStudent = async (studentId: string) => {
  const config = await getAuthHeader();
  return axios.get(`${API_URL}/student/${studentId}`, config);
};
// 📄 Lấy invoice theo tháng
export const getInvoicesByMonth = async (month: number, year: number) => {
  const config = await getAuthHeader();
  return axios.get(`${API_URL}/month?month=${month}&year=${year}`, config);
};

// 📄 Lấy chi tiết 1 invoice
export const getInvoiceDetail = async (invoiceId: string) => {
  const config = await getAuthHeader();
  return axios.get(`${API_URL}/detail/${invoiceId}`, config);
};

// 💰 Thanh toán invoice
export const payInvoice = async (invoiceId: string) => {
  const config = await getAuthHeader();
  return axios.patch(`${API_URL}/pay/${invoiceId}`, {}, config);
};

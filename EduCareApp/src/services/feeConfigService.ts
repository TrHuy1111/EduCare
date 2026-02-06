// EduCareApp/src/services/feeConfigService.ts
import axios from "axios";
import auth from "@react-native-firebase/auth";
import { API_BASE_URL } from '@env';

const API_URL = `${API_BASE_URL}/fee-config`;

//Auth header
const getAuthHeader = async () => {
  const user = auth().currentUser;
  if (!user) throw new Error("Not logged in");

  const token = await user.getIdToken(true);
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// 🟢 Lấy cấu hình học phí theo tháng
export const getFeeConfig = async (month: number, year: number) => {
  const config = await getAuthHeader();
  return axios.get(`${API_URL}?month=${month}&year=${year}`, config);
};

// 🟢 Tạo / cập nhật cấu hình học phí
export const upsertFeeConfig = async (data: {
  month: number;
  year: number;
  levelFees: Array<{ level: string; amount: number }>;
  extraFees: Array<{ key: string; name: string; amount: number }>;
}) => {
  const config = await getAuthHeader();
  return axios.post(API_URL, data, config);
};

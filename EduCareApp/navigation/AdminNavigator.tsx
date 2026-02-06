// navigation/AdminNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CustomHeader from '../screens/components/CustomHeader';
import BottomTabs from './BottomTabs';
import AdminStudentListScreen from '../screens/AdminStudentListScreen';
import AdminStudentFormScreen from '../screens/AdminStudentFormScreen';
import AdminUserListScreen from '../screens/AdminUserListScreen';
import AdminClassManagementScreen from '../screens/AdminClassManagementScreen';
import AdminAnnouncementListScreen from '../screens/AdminAnnouncementListScreen';
import AdminAnnouncementCreateScreen from '../screens/AdminAnnouncementCreateScreen';
import AdminAnnouncementEditScreen from '../screens/AdminAnnouncementEditScreen';
import AdminFeeConfigScreen from '../screens/AdminFeeConfigScreen';
import AdminTuitionGenerateScreen from '../screens/AdminTuitionGenerateScreen';
import AdminTuitionListScreen from '../screens/AdminTuitionListScreen';
import AdminTuitionDetailScreen from '../screens/AdminTuitionDetailScreen';
import AnnouncementListScreen from '../screens/AnnouncementListScreen';
import AnnouncementDetailScreen from '../screens/AnnouncementDetailScreen';
import AdminCameraScreen from '../screens/AdminCameraScreen';
import AdminTuitionMenuScreen from '../screens/AdminTuitionMenuScreen';
import AdminTuitionStatsScreen from '../screens/AdminTuitionStatsScreen';
// 🧩 1️⃣ Định nghĩa type cho toàn bộ stack này
export type AdminStackParamList = {
  BottomTabs: undefined;
  AdminStudentList: undefined;
  AdminStudentForm: { editId?: string };
  AdminUserList: undefined;
  AdminClassManagement: undefined;
  AdminAnnouncementList: undefined;
  AdminAnnouncementCreate: undefined;
  AdminAnnouncementEdit: { id: string };
  AdminFeeConfig: undefined;
  AdminTuitionGenerate: undefined;
  AdminTuitionList: { month: number; year: number };
  AdminTuitionDetail: {
  invoiceId: string;
  };
  AnnouncementList: undefined;
  AnnouncementDetail: { announcementId: string };
  AdminCamera : undefined;
  AdminTuitionMenu: undefined;
  AdminTuitionStats: undefined;
};

// 🧩 2️⃣ Tạo Stack có type
const Stack = createNativeStackNavigator<AdminStackParamList>();

// 🧩 3️⃣ Xuất component chính của Navigator
export default function AdminNavigator() {
  return (
    <Stack.Navigator screenOptions={{ header: (props) => <CustomHeader {...props} />,
        headerShown: true, }}>
      <Stack.Screen name="BottomTabs" component={BottomTabs} options={{ headerShown: false }}/>
      <Stack.Screen name="AdminStudentList" component={AdminStudentListScreen} options={{ title: "Quản lý học sinh" }}/>
      <Stack.Screen name="AdminStudentForm" component={AdminStudentFormScreen} options={{ title: "Chi tiết học sinh" }}/>
      <Stack.Screen name="AdminUserList" component={AdminUserListScreen} options={{ title: "Quản lý User" }}/>
      <Stack.Screen name="AdminClassManagement" component={AdminClassManagementScreen} options={{ title: " Quản lý lớp học" }}/>
      <Stack.Screen name="AdminAnnouncementList" component={AdminAnnouncementListScreen} options={{ title: " Quản lý sự kiện" }} />
      <Stack.Screen name="AdminAnnouncementCreate" component={AdminAnnouncementCreateScreen} options={{ title: "" }} />
      <Stack.Screen name="AdminAnnouncementEdit" component={AdminAnnouncementEditScreen} options={{ title: "" }}/>
      <Stack.Screen name="AdminFeeConfig" component={AdminFeeConfigScreen} options={{ title: " Cấu hình học phí" }}/>
      <Stack.Screen name="AdminTuitionGenerate" component={AdminTuitionGenerateScreen} options={{ title: " Tạo học phí theo tháng" }}/>
      <Stack.Screen name="AdminTuitionList" component={AdminTuitionListScreen} options={{ title: "Danh sách hóa đơn" }}/>
      <Stack.Screen name="AdminTuitionDetail" component={AdminTuitionDetailScreen} options={{ title: "Chi tiết hóa đơn" }}/>
      <Stack.Screen name="AnnouncementList" component={AnnouncementListScreen} options={{ title: "📣 Tất cả sự kiện" }}/>
      <Stack.Screen name="AnnouncementDetail" component={AnnouncementDetailScreen} options={{ title: "" }}/>
      <Stack.Screen name="AdminCamera" component={AdminCameraScreen} options={{ title: "Quản lý camera lớp học" }} />
      <Stack.Screen name="AdminTuitionMenu" component={AdminTuitionMenuScreen} options={{ title: " Quản lý Tài chính" }}/>
      <Stack.Screen name="AdminTuitionStats" component={AdminTuitionStatsScreen} options={{ title: " Biểu đồ Doanh thu" }} />
    </Stack.Navigator>
  );
}

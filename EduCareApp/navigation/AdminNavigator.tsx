// navigation/AdminNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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
};

// 🧩 2️⃣ Tạo Stack có type
const Stack = createNativeStackNavigator<AdminStackParamList>();

// 🧩 3️⃣ Xuất component chính của Navigator
export default function AdminNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BottomTabs" component={BottomTabs} />
      <Stack.Screen name="AdminStudentList" component={AdminStudentListScreen} />
      <Stack.Screen name="AdminStudentForm" component={AdminStudentFormScreen} />
      <Stack.Screen name="AdminUserList" component={AdminUserListScreen} />
      <Stack.Screen name="AdminClassManagement" component={AdminClassManagementScreen} />
      <Stack.Screen name="AdminAnnouncementList" component={AdminAnnouncementListScreen} />
      <Stack.Screen name="AdminAnnouncementCreate" component={AdminAnnouncementCreateScreen} />
      <Stack.Screen name="AdminAnnouncementEdit" component={AdminAnnouncementEditScreen} />
      <Stack.Screen name="AdminFeeConfig" component={AdminFeeConfigScreen} />
      <Stack.Screen name="AdminTuitionGenerate" component={AdminTuitionGenerateScreen} />
      <Stack.Screen name="AdminTuitionList" component={AdminTuitionListScreen} />
      <Stack.Screen name="AdminTuitionDetail" component={AdminTuitionDetailScreen} />
      <Stack.Screen name="AnnouncementList" component={AnnouncementListScreen} />
      <Stack.Screen name="AnnouncementDetail" component={AnnouncementDetailScreen} />
      <Stack.Screen name="AdminCamera" component={AdminCameraScreen} />
      
    </Stack.Navigator>
  );
}

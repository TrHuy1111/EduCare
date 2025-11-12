// navigation/AdminNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabs from './BottomTabs';
import AdminStudentListScreen from '../screens/AdminStudentListScreen';
import AdminStudentFormScreen from '../screens/AdminStudentFormScreen';

// 🧩 1️⃣ Định nghĩa type cho toàn bộ stack này
export type AdminStackParamList = {
  BottomTabs: undefined;
  AdminStudentList: undefined;
  AdminStudentForm: { editId?: string };
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
    </Stack.Navigator>
  );
}

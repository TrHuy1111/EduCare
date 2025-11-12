// navigation/AppNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthNavigator from './AuthNavigator';
import AdminNavigator from './AdminNavigator';
import TeacherNavigator from './TeacherNavigator';
import ParentNavigator from './ParentNavigator';
import AdminUserListScreen from '../screens/AdminUserListScreen';
import AdminClassManagement from '../screens/AdminClassManagementScreen';
import TeacherStudentListScreen from '../screens/TeacherStudentListScreen';
import StudentProfileScreen from '../screens/StudentProfileScreen';
const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Đăng nhập */}
      <Stack.Screen name="Auth" component={AuthNavigator} />

      {/* Role-based stacks */}
      
      <Stack.Screen name="AdminApp" component={AdminNavigator} />
      <Stack.Screen name="TeacherApp" component={TeacherNavigator} />
      <Stack.Screen name="ParentApp" component={ParentNavigator} />
      <Stack.Screen name="AdminUserList" component={AdminUserListScreen} />
      <Stack.Screen name="AdminClassManagement" component={AdminClassManagement} />
      <Stack.Screen name="TeacherStudentList" component={TeacherStudentListScreen} />
      <Stack.Screen name="StudentProfile" component={StudentProfileScreen} />
      
      
    </Stack.Navigator>
  );
}

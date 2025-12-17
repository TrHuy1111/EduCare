// navigation/TeacherNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabs from './BottomTabs';
import TeacherStudentListScreen from '../screens/TeacherStudentListScreen';
import StudentProfileScreen from '../screens/StudentProfileScreen';
import StudentFilterScreen from '../screens/StudentFilterScreen';
import AttendanceHomeScreen from '../screens/AttendanceHomeScreen';
import AttendanceStudentScreen from '../screens/AttendanceStudentScreen';
import TeacherActivitiesScreen from '../screens/TeacherActivitiesScreen';
import EditActivitiesScreen from '../screens/EditActivitiesScreen';
import AttendanceHistoryScreen from '../screens/AttendanceHistoryScreen';
import AttendanceDetailScreen from '../screens/AttendanceDetailScreen';
import AnnouncementListScreen from '../screens/AnnouncementListScreen';
const Stack = createNativeStackNavigator<TeacherStackParamList>();
export type TeacherStackParamList = {
  BottomTabs: undefined;
  TeacherStudentList: { filters?: any } | undefined;
  StudentProfile: { studentId: string };
  StudentFilter: { filters?: any } | undefined; 

  AttendanceHome: undefined;
  AttendanceStudentScreen: {
    classId: string;
    session: "morning" | "afternoon";
    date: string;
  };
  TeacherActivity: {
    classId: string;
    date: string;
  };
   EditActivitiesScreen: {
    classId: string;
    date: string;
  };
  AttendanceHistory: undefined;
  AttendanceDetailScreen: {
    classId: string;
    date: string;
  };
  AnnouncementList: undefined;

};

export default function TeacherNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BottomTabs" component={BottomTabs} />
      <Stack.Screen name="TeacherStudentList" component={TeacherStudentListScreen} />
      <Stack.Screen name="StudentProfile" component={StudentProfileScreen} />
      <Stack.Screen name="StudentFilter" component={StudentFilterScreen} />
      <Stack.Screen name="AttendanceHome" component={AttendanceHomeScreen} />
      <Stack.Screen name="AttendanceStudentScreen" component={AttendanceStudentScreen} />
      <Stack.Screen name="TeacherActivity" component={TeacherActivitiesScreen} />
      <Stack.Screen name="EditActivitiesScreen" component={EditActivitiesScreen} />
      <Stack.Screen name="AttendanceHistory" component={AttendanceHistoryScreen} />
      <Stack.Screen name="AttendanceDetailScreen" component={AttendanceDetailScreen} />
      <Stack.Screen name="AnnouncementList" component={AnnouncementListScreen} />
    </Stack.Navigator>
  );
}

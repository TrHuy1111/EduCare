// navigation/TeacherNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabs from './BottomTabs';
import CustomHeader from '../screens/components/CustomHeader';
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
import AnnouncementDetailScreen from '../screens/AnnouncementDetailScreen';
import TeacherFeedbackScreen from '../screens/TeacherFeedbackScreen';
import TeacherStatsScreen from '../screens/TeacherStatsScreen';

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
  AnnouncementDetail: { announcementId: string };
  TeacherFeedBackScreen: undefined;
  TeacherStatsScreen: undefined;

};

export default function TeacherNavigator() {
  return (
    <Stack.Navigator screenOptions={{ header: (props) => <CustomHeader {...props} />,
            headerShown: true, }}>
      <Stack.Screen name="BottomTabs" component={BottomTabs} options={{ headerShown: false }}/>
      <Stack.Screen name="TeacherStudentList" component={TeacherStudentListScreen} options={{ title: "Danh sách học sinh" }}/>
      <Stack.Screen name="StudentProfile" component={StudentProfileScreen} options={{ title: "" }}/>
      <Stack.Screen name="StudentFilter" component={StudentFilterScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="AttendanceHome" component={AttendanceHomeScreen} options={{ title: "Điểm danh" }}/>
      <Stack.Screen name="AttendanceStudentScreen" component={AttendanceStudentScreen} options={{ title: "Danh sách điểm danh" }}/>
      <Stack.Screen name="TeacherActivity" component={TeacherActivitiesScreen} options={{ title: "Lịch hoạt động" }} />
      <Stack.Screen name="EditActivitiesScreen" component={EditActivitiesScreen}  options={{ title: "Chỉnh sửa hoạt động" }}/>
      <Stack.Screen name="AttendanceHistory" component={AttendanceHistoryScreen} options={{ title: "Lịch sử điểm danh" }}/>
      <Stack.Screen name="AttendanceDetailScreen" component={AttendanceDetailScreen} options={{ title: "" }}/>
      <Stack.Screen name="AnnouncementList" component={AnnouncementListScreen} options={{ title: "📣 Tất cả sự kiện" }}/>
      <Stack.Screen name="AnnouncementDetail" component={AnnouncementDetailScreen} options={{ title: "" }}/>
      <Stack.Screen name="TeacherFeedBackScreen" component={TeacherFeedbackScreen} options={{ title: "Nhận xét hoạt động" }}/>
      <Stack.Screen name="TeacherStatsScreen" component={TeacherStatsScreen} options={{ title: "Biểu đồ nhận xét" }}/>
    </Stack.Navigator>
  );
}

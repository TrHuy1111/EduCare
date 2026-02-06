// navigation/ParentNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabs from './BottomTabs';
import CustomHeader from '../screens/components/CustomHeader';
import StudentProfileScreen from '../screens/StudentProfileScreen';
import ParentTuitionScreen from '../screens/ParentTuitionScreen';
import AnnouncementListScreen from '../screens/AnnouncementListScreen';
import AnnouncementDetailScreen from '../screens/AnnouncementDetailScreen';
import ParentCameraScreen from '../screens/ParentCameraScreen';
import ParentActivitiesScreen from '../screens/ParentActivitiesScreen';
import ParentFeedbackScreen from '../screens/ParentFeedbackScreen';
import ParentClassInfoScreen from '../screens/ParentClassInfoScreen';
const Stack = createNativeStackNavigator();

export default function ParentNavigator() {
  return (
    <Stack.Navigator screenOptions={{ header: (props) => <CustomHeader {...props} />, 
    headerShown: true, }}>
      <Stack.Screen name="BottomTabs" component={BottomTabs} options={{ headerShown: false }}/>
      <Stack.Screen name="StudentProfile" component={StudentProfileScreen} />
      <Stack.Screen name="ParentTuition" component={ParentTuitionScreen} options={{ title: "Học phí" }}/>
      <Stack.Screen name="AnnouncementList" component={AnnouncementListScreen} options={{ title: "📣 Tất cả sự kiện" }}/>
      <Stack.Screen name="AnnouncementDetail" component={AnnouncementDetailScreen} options={{ title: "" }}/>
      <Stack.Screen name="ParentCamera" component={ParentCameraScreen} options={{ title: "Camera lớp học" }}/>
      <Stack.Screen name="ParentActivities" component={ParentActivitiesScreen}  options={{ title: "Lịch hoạt động của bé" }}/>
      <Stack.Screen name="ParentFeedBackScreen" component={ParentFeedbackScreen}  options={{ title: "Nhận xét của bé" }}/>
      <Stack.Screen name="ParentClassInfo" component={ParentClassInfoScreen}  options={{ title: "Thông tin lớp học" }}/>
    </Stack.Navigator>
  );
}

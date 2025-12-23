// navigation/ParentNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabs from './BottomTabs';
import StudentProfileScreen from '../screens/StudentProfileScreen';
import ParentTuitionScreen from '../screens/ParentTuitionScreen';
import AnnouncementListScreen from '../screens/AnnouncementListScreen';
import ParentCameraScreen from '../screens/ParentCameraScreen';
import ParentActivitiesScreen from '../screens/ParentActivitiesScreen';
import ParentFeedbackScreen from '../screens/ParentFeedbackScreen';
const Stack = createNativeStackNavigator();

export default function ParentNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BottomTabs" component={BottomTabs} />
      <Stack.Screen name="StudentProfile" component={StudentProfileScreen} />
      <Stack.Screen name="ParentTuition" component={ParentTuitionScreen} />
      <Stack.Screen name="AnnouncementList" component={AnnouncementListScreen} />
      <Stack.Screen name="ParentCamera" component={ParentCameraScreen} />
      <Stack.Screen name="ParentActivities" component={ParentActivitiesScreen} />
      <Stack.Screen name="ParentFeedBackScreen" component={ParentFeedbackScreen} />
    </Stack.Navigator>
  );
}

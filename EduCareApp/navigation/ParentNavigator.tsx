// navigation/ParentNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabs from './BottomTabs';
import StudentProfileScreen from '../screens/StudentProfileScreen';
import ParentTuitionScreen from '../screens/ParentTuitionScreen';
import AnnouncementListScreen from '../screens/AnnouncementListScreen';
const Stack = createNativeStackNavigator();

export default function ParentNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BottomTabs" component={BottomTabs} />
      <Stack.Screen name="StudentProfile" component={StudentProfileScreen} />
      <Stack.Screen name="ParentTuition" component={ParentTuitionScreen} />
      <Stack.Screen name="AnnouncementList" component={AnnouncementListScreen} />
    </Stack.Navigator>
  );
}

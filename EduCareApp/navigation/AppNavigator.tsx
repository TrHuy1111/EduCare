// navigation/AppNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminNavigator from './AdminNavigator';
import TeacherNavigator from './TeacherNavigator';
import ParentNavigator from './ParentNavigator';
import AuthLoadingScreen from '../screens/AuthLoadingScreen'; 
import AuthNavigator from './AuthNavigator';
const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AuthLoading" component={AuthLoadingScreen} />
      <Stack.Screen name="Auth" component={AuthNavigator} />

      {/* Role-based stacks */}
      
      <Stack.Screen name="AdminApp" component={AdminNavigator} />
      <Stack.Screen name="TeacherApp" component={TeacherNavigator} />
      <Stack.Screen name="ParentApp" component={ParentNavigator} />
    </Stack.Navigator>
  );
}

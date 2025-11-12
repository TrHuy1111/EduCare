import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, View, Text } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import DashboardScreen from '../screens/DashboardScreen';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#10B981',
        tabBarInactiveTintColor: '#999',
        tabBarIcon: ({ focused, color }) => {
          let iconPath;

          switch (route.name) {
            case 'Home':
              iconPath = require('../assets/icons/home.png');
              break;
            case 'Dashboard':
              iconPath = require('../assets/icons/dashboard.png');
              break;
            case 'Settings':
              iconPath = require('../assets/icons/setting.png');
              break;
          }

          return (
            <Image
              source={iconPath}
              style={{
                width: 24,
                height: 24,
                tintColor: color, // 👈 tự đổi màu theo active/inactive
                resizeMode: 'contain',
              }}
            />
          );
        },
      })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen
        name="Settings"
        component={() => (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text>⚙️ Settings Screen</Text>
          </View>
        )}
      />
    </Tab.Navigator>
  );
}

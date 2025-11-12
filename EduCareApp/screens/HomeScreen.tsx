import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export default function HomeScreen() {
  const navigation = useNavigation();

  const handleLogout = async () => {
  try {
    await auth().signOut();
    await GoogleSignin.signOut();

    Alert.alert('✅ Logged out', 'You have been logged out successfully.');

    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' as never }], 
    });
  } catch (error: any) {
    Alert.alert('❌ Logout failed', error.message);
  }
};

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>EduCare Dashboard</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logout}>Log out</Text>
        </TouchableOpacity>
      </View>

      {/* Logo + Welcome text */}
      <Image
        source={require('../assets/LogoEduCare.png')}
        style={{ width: 120, height: 120, marginBottom: 20 }}
      />
      <Text style={styles.welcome}>Welcome to Home Screen 🎉</Text>
      <Text style={styles.name}>{auth().currentUser?.displayName}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6FDF3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContainer: {
    position: 'absolute',
    top: 40,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#064E3B',
  },
  logout: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: 'bold',
  },
  welcome: {
    fontSize: 16,
    color: '#065f46',
  },
  name: {
    color: '#047857',
    marginTop: 6,
  },
});

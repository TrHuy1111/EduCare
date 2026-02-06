// screens/AuthLoadingScreen.tsx
import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Image, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { syncUserToBackend } from '../src/services/userService';

export default function AuthLoadingScreen() {
  const navigation = useNavigation<any>();

  useEffect(() => {
    // Lắng nghe trạng thái Auth (nhưng chỉ xử lý lần đầu tiên)
    const unsubscribe = auth().onAuthStateChanged(async (user) => {
      // 👇 Ngắt lắng nghe ngay lập tức để tránh loop khi logout/login lại
      unsubscribe(); 

      if (user) {
        // 🟢 CÓ USER -> ĐỒNG BỘ & VÀO APP
        try {
          console.log("🔄 Auto-login detected...");
          const userBackend = await syncUserToBackend(); 
          
          const role = userBackend.role;
          if (role === 'admin') navigation.replace('AdminApp');
          else if (role === 'teacher') navigation.replace('TeacherApp');
          else navigation.replace('ParentApp');

        } catch (error) {
          console.error("❌ Auto-login failed:", error);
          // Nếu lỗi thì đá về Login cho an toàn
          navigation.replace('Auth'); 
        }
      } else {
        // 🔴 KHÔNG CÓ USER -> VỀ LOGIN
        navigation.replace('Auth'); 
      }
    });

    return () => unsubscribe(); // Cleanup
  }, []);

  return (
    <View style={styles.container}>
      <Image 
        source={require('../assets/LogoEduCare.png')} 
        style={{width: 120, height: 120, marginBottom: 20}} 
        resizeMode="contain" 
      />
      <ActivityIndicator size="large" color="#10B981" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E6FDF3' },
});
import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Image, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { syncUserToBackend, getCurrentUserRole } from '../src/services/userService';

export default function AuthLoadingScreen() {
  const navigation = useNavigation<any>();

  useEffect(() => {
    // Lắng nghe trạng thái Auth
    const unsubscribe = auth().onAuthStateChanged(async (user) => {
      if (user) {
        // 🟢 CÓ USER FIREBASE -> CHECK BACKEND
        try {
          console.log("🔄 Đang kiểm tra đồng bộ dữ liệu...");
          
          // Gọi hàm này để đảm bảo DB MongoDB có user này
          // Nếu DB mất dữ liệu, hàm này sẽ tự tạo lại (Self-healing)
          const userBackend = await syncUserToBackend(); 
          
          // Điều hướng đúng role
          const role = userBackend.role;
          if (role === 'admin') navigation.replace('AdminApp');
          else if (role === 'teacher') navigation.replace('TeacherApp');
          else navigation.replace('ParentApp');

        } catch (error) {
          console.error("❌ Lỗi đồng bộ Backend:", error);
          
          //  Nếu Backend chết hoặc lỗi nặng -> Logout để user đăng nhập lại sau
          Alert.alert(
            "Lỗi kết nối", 
            "Không thể đồng bộ dữ liệu người dùng. Vui lòng đăng nhập lại.",
            [{ text: "OK", onPress: () => auth().signOut() }]
          );
        }
      } else {
        // 🔴 KHÔNG CÓ USER -> VỀ LOGIN
        // Giả sử bạn có AuthStack chứa LoginScreen
        navigation.replace('Auth'); 
      }
    });

    return unsubscribe;
  }, []);

  return (
    <View style={styles.container}>
      {/* Logo App */}
      <Image source={require('../assets/LogoEduCare.png')} style={{width: 100, height: 100, marginBottom: 20}} resizeMode="contain" />
      <ActivityIndicator size="large" color="#10B981" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E6FDF3' }
});
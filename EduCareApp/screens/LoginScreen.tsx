// screens/LoginScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, KeyboardAvoidingView, Platform,Alert } from 'react-native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthNavigator';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import { signInWithEmailAndPassword } from '@react-native-firebase/auth';   
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { syncUserToBackend} from '../src/services/userService';
import { jwtDecode } from 'jwt-decode';

type RootParamList = AuthStackParamList & {
  AdminApp: undefined;
  TeacherApp: undefined;
  ParentApp: undefined;
};
type NavProp = NativeStackNavigationProp<RootParamList>;
type GoogleUserInfo = {
  data?: { idToken?: string };
  idToken?: string;
};
export default function LoginScreen() {
  const navigation = useNavigation<NavProp>();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Vui lòng nhập email và mật khẩu'); // Tiếng Việt
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("🔹 Đang login Firebase...");
      await signInWithEmailAndPassword(auth(), email.trim(), password);
      
      console.log("🔹 Đang sync với Backend...");
      const userBackend = await syncUserToBackend();

      // ... (Phần điều hướng giữ nguyên) ...
      const role = userBackend.role;
      if (role === 'admin') navigation.replace('AdminApp' as any);
      else if (role === 'teacher') navigation.replace('TeacherApp' as any);
      else navigation.replace('ParentApp' as any);

    } catch (err: any) {
      console.log("❌ Login Failed:", err);
      
      // Fail-safe logout logic (giữ nguyên)
      if (auth().currentUser) {
        await auth().signOut(); 
      }

      // XỬ LÝ THÔNG BÁO LỖI 
      let msg = "Đăng nhập thất bại";
      
      // Firebase trả về các mã lỗi sau:
      switch (err.code) {
        case 'auth/invalid-credential': 
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          msg = "Email hoặc mật khẩu không chính xác"; 
          break;
        case 'auth/invalid-email':
          msg = "Định dạng email không hợp lệ";
          break;
        case 'auth/too-many-requests':
          msg = "Đăng nhập sai quá nhiều lần. Vui lòng thử lại sau.";
          break;
        case 'auth/network-request-failed':
           msg = "Lỗi kết nối mạng. Vui lòng kiểm tra lại 3G/Wifi.";
           break;
        default:
          // Nếu lỗi từ Backend (axios response)
          if (err.response && err.response.data && err.response.data.message) {
            msg = "Lỗi hệ thống: " + err.response.data.message;
          } else {
            msg = "Đã xảy ra lỗi: " + err.message;
          }
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1️⃣ Check Google Services
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      // 2️⃣ Mở popup Google đăng nhập
      // const { idToken } = await GoogleSignin.signIn(); // Cũ
      const signInResult = await GoogleSignin.signIn(); // Mới (tuỳ phiên bản thư viện)
      const idToken = signInResult.data?.idToken;

      if (!idToken) {
        throw new Error('No ID token found');
      }

      // 3️⃣ Tạo Credential và Login vào Firebase
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      console.log("🔹 Đang login Firebase với Google...");
      await auth().signInWithCredential(googleCredential);

      // 4️⃣ SYNC VỚI BACKEND (QUAN TRỌNG)
      console.log("🔹 Đang sync Google User với Backend...");
      const userBackend = await syncUserToBackend();

      // 5️⃣ Điều hướng theo Role
      const role = userBackend.role;
      if (role === 'admin') navigation.replace('AdminApp' as any);
      else if (role === 'teacher') navigation.replace('TeacherApp' as any);
      else navigation.replace('ParentApp' as any);

    } catch (err: any) {
      if (err.code === '12501') {
        // User bấm hủy (Cancel) -> Không làm gì cả
        console.log('User cancelled Google Signin');
        setLoading(false);
        return;
      }

      console.error("❌ Google Login Error:", err);

      // 🔥 FAIL-SAFE: Logout Firebase nếu Backend lỗi
      if (auth().currentUser) {
        await auth().signOut();
        // Cần revoke Google nữa để lần sau nó hỏi lại tài khoản (tránh kẹt)
        try { await GoogleSignin.revokeAccess(); } catch (e) {}
      }

      Alert.alert("Lỗi đăng nhập Google", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.top}>
          {/* Replace with your logo later */}
          <View style={styles.logoWrap}>
            <Image source={require('../assets/LogoEduCare.png')} style={styles.logo} />
          </View>
        </View>

        <View style={styles.form}>
          <Text style={styles.title}>Login</Text>

          <CustomInput iconName="mail-outline" placeholder="Email" value={email} onChangeText={(text) => {
            setEmail(text);
            if (error) setError(null); 
          }}  keyboardType="email-address" />
          <CustomInput iconName="key-outline" placeholder="Mật khẩu" value={password} 
            onChangeText={(text) => {
              setPassword(text);
              if (error) setError(null); 
            }} 
            secureTextEntry 
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.smallLink}>Don't have an account? Sign up</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={{ color: '#0ea5a0', textAlign: 'center', marginTop: 8 }}>
              Forgot Password?
            </Text>
          </TouchableOpacity>

          <CustomButton title="Login" onPress={handleLogin} loading={loading} />

          <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleLogin}>
                      <Image source={require('../assets/ggLogo.png')} style={styles.googleIcon} />
                      <Text style={styles.googleText}>Login with Google</Text>
                  </TouchableOpacity>
          <TouchableOpacity style={styles.googleBtn} onPress={() => navigation.navigate('PhoneAuth')}>
            <Image source={require('../assets/phone.png')} style={styles.googleIcon} />
            <Text style={styles.googleText}>Login with Phone</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E6FDF3' },
  top: {
    height: 220,
    backgroundColor: '#8FEAD0',
    borderBottomLeftRadius: 160,
    borderBottomRightRadius: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { width: 100, height: 100, resizeMode: 'contain' },
  form: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8, color: '#064E3B' },
  smallLink: { color: '#0ea5a0', textAlign: 'center', marginVertical: 8 },
  error: { color: '#DC2626', textAlign: 'center', marginVertical: 6 },
  googleBtn: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 1,
  borderColor: '#ccc',
  paddingVertical: 10,
  borderRadius: 8,
  marginTop: 16,
  backgroundColor: '#fff',
},
googleIcon: {
  width: 20,
  height: 20,
  marginRight: 10,
},
googleText: {
  fontSize: 16,
  color: '#000',
  fontWeight: '500',
},
});

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
type NavProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;
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
    setError('Enter email and password');
    return;
  }

  setLoading(true);
  try {
    await auth().signInWithEmailAndPassword(email, password);

    const currentUser = auth().currentUser;
    if (currentUser) {
      const userData = await syncUserToBackend(); // ⚡ lấy từ backend
      const role = userData.role;
      console.log('🎭 Role from backend:', role);

      if (role === 'admin') {
        navigation.reset({ index: 0, routes: [{ name: 'AdminApp' as never }] });
      } else if (role === 'teacher') {
        navigation.reset({ index: 0, routes: [{ name: 'TeacherApp' as never }] });
      } else if (role === 'parent') {
        navigation.reset({ index: 0, routes: [{ name: 'ParentApp' as never }] });
      } else {
        Alert.alert('Access Denied', 'Your role is not recognized.');
      }
    }
  } catch (e: any) {
    console.error('❌ Login error:', e);
    setError(e.message || 'Login failed');
  } finally {
    setLoading(false);
  }
};

  const handleGoogleLogin = async () => {
  try {
    setError(null);
    setLoading(true);

    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    // ⚡ Kiểm tra user đã sign in chưa
    const currentUser = await GoogleSignin.getCurrentUser();
    let idToken: string | undefined;

    if (currentUser) {
      console.log("✅ User already signed in, reusing token");
      const tokens = await GoogleSignin.getTokens();
      idToken = tokens.idToken;
    } else {
      // 🆕 Nếu chưa sign-in thì gọi signIn()
      const userInfo = await GoogleSignin.signIn();
      // 🔥 Fix cho SDK mới
      idToken = (userInfo as any)?.data?.idToken || (userInfo as any)?.idToken;
    }

    if (!idToken) throw new Error("No ID Token returned from Google");

    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    await auth().signInWithCredential(googleCredential);

    const userData = await syncUserToBackend();
    const role = userData?.role;

    if (role === "admin") {
      navigation.reset({ index: 0, routes: [{ name: "AdminApp" as never }] });
    } else if (role === "teacher") {
      navigation.reset({ index: 0, routes: [{ name: "TeacherApp" as never }] });
    } else if (role === "parent") {
      navigation.reset({ index: 0, routes: [{ name: "ParentApp" as never }] });
    } else {
      Alert.alert("Access Denied", "Your role is not recognized.");
    }

  } catch (error: any) {
    console.error("❌ Google Sign-In Error:", error.message);
    setError(error.message || "Google Sign-In failed");
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

          <CustomInput iconName="mail-outline" placeholder="User Name" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <CustomInput iconName="key-outline" placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />

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

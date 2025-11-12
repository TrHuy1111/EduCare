// screens/RegisterScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, KeyboardAvoidingView,TouchableOpacity, Platform,Alert } from 'react-native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import auth from '@react-native-firebase/auth';
import { createUserWithEmailAndPassword, updateProfile } from '@react-native-firebase/auth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthNavigator';
import { useNavigation } from '@react-navigation/native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { syncUserToBackend} from '../src/services/userService';
type NavProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

export default function RegisterScreen() {
  const navigation = useNavigation<NavProp>();
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
  setLoading(true);
  try {
    const userCredential = await createUserWithEmailAndPassword(auth(), email.trim(), password);
    await userCredential.user.updateProfile({ displayName: fullname });

    // ✅ Gửi thông tin Firebase user lên backend
    await syncUserToBackend();

    Alert.alert("✅ Success", "Account created successfully!");
  } catch (e: any) {
    console.log("❌ Register error:", e.message);
    setError(e.message);
  } finally {
    setLoading(false);
  }
};
  const signUpWithGoogle = async () => {
  try {
    setError(null);

    // 1. Đăng xuất khỏi tài khoản Google trước đó (nếu có)
    await GoogleSignin.signOut(); // hoặc dùng revokeAccess() nếu muốn xoá hẳn quyền

    // 2. Kiểm tra Play Services
    await GoogleSignin.hasPlayServices();

    // 3. Mở giao diện chọn tài khoản Google
    const userInfo = await GoogleSignin.signIn();
    const idToken = userInfo.data?.idToken;

    if (!idToken) {
      setError('');
      return;
    }

    // 4. Đăng nhập Firebase bằng Google credential
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    await auth().signInWithCredential(googleCredential);
    await syncUserToBackend();

    Alert.alert("✅ Success", "Account created successfully with Google!");
    
  } catch (err: any) {
    console.log(err);
    setError(err.message || 'Google Sign-Up failed');
  }
};

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.top}>
          <View style={styles.logoWrap}>
            <Image source={require('../assets/LogoEduCare.png')} style={styles.logo} />
          </View>
        </View>

        <View style={styles.form}>
          <Text style={styles.title}>Sign up</Text>

          <CustomInput iconName="person-outline" placeholder="Fullname" value={fullname} onChangeText={setFullname} />
          <CustomInput iconName="mail-outline" placeholder="Enter email" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <CustomInput iconName="key-outline" placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
          <CustomInput iconName="call-outline" placeholder="Phone number" value={phone} onChangeText={setPhone} keyboardType="numeric" />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <CustomButton title="Sign up" onPress={handleRegister} loading={loading} />
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={{ color: '#0ea5a0', textAlign: 'center', marginTop: 12 }}>
            Already have an account? Login
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.googleBtn} onPress={signUpWithGoogle}>
            <Image source={require('../assets/ggLogo.png')} style={styles.googleIcon} />
            <Text style={styles.googleText}>Sign up with Google</Text>
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

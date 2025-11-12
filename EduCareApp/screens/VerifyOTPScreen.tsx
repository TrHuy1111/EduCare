// screens/VerifyOTPScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import auth from "@react-native-firebase/auth";
import { useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../navigation/AuthNavigator";

type NavProp = NativeStackNavigationProp<AuthStackParamList, "VerifyOTP">;

export default function VerifyOTPScreen() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NavProp>();
  const route = useRoute();
  const { confirmation }: any = route.params || {};

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      Alert.alert("⚠️ Missing OTP", "Vui lòng nhập mã OTP");
      return;
    }

    try {
      setLoading(true);

      // ✅ 1. Xác thực OTP với Firebase
      const userCredential = await confirmation.confirm(otp);
      const user = userCredential.user;
      console.log("✅ OTP verified, user:", user.phoneNumber);

      // ✅ 2. Lấy Firebase ID Token
      const idToken = await user.getIdToken(true);

      // ✅ 3. Gọi API sync (body rỗng, token trong header)
      const res = await axios.post(
        "http://192.168.118.1:5000/api/user/sync",
        {},
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );

      console.log("🎯 Sync response:", res.data);
      Alert.alert("✅ Success", `Welcome ${res.data.user.name || user.phoneNumber}!`);

      navigation.reset({ index: 0, routes: [{ name: 'ParentApp' as never }] });
    } catch (error: any) {
      console.error("❌ OTP Verify Error:", error.response?.data || error.message);
      Alert.alert("Lỗi xác thực OTP", error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔢 Verify OTP</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter 6-digit code"
        keyboardType="numeric"
        value={otp}
        onChangeText={setOtp}
      />

      <TouchableOpacity
        style={[styles.btn, loading && { opacity: 0.6 }]}
        onPress={handleVerifyOTP}
        disabled={loading}
      >
        <Text style={styles.btnText}>
          {loading ? "Verifying..." : "Verify OTP"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E6FDF3", justifyContent: "center", alignItems: "center", padding: 16 },
  title: { fontSize: 22, fontWeight: "bold", color: "#064E3B", marginBottom: 24 },
  input: {
    backgroundColor: "#fff",
    width: "80%",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 16,
    textAlign: "center",
    letterSpacing: 4,
  },
  btn: { backgroundColor: "#10B981", width: "80%", padding: 14, borderRadius: 10, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

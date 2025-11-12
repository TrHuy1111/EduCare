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
import { useNavigation } from "@react-navigation/native";
import { AuthStackParamList } from "../navigation/AuthNavigator";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import VerifyOTPScreen from "./VerifyOTPScreen";
type NavProp = NativeStackNavigationProp<AuthStackParamList, 'PhoneAuth'>;
export default function PhoneAuthScreen() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NavProp>();

  const handleSendOTP = async () => {
    if (!phone.startsWith("+84")) {
      Alert.alert("⚠️ Lưu ý", "Vui lòng nhập số điện thoại dạng +84xxxxxxxx");
      return;
    }

    try {
      setLoading(true);
      const confirmation = await auth().signInWithPhoneNumber(phone);
      Alert.alert("✅ OTP sent", "Kiểm tra tin nhắn SMS trên điện thoại của bạn!");
      navigation.navigate("VerifyOTP", { confirmation });
    } catch (error: any) {
      console.log("❌ Send OTP Error:", error);
      Alert.alert("Lỗi gửi OTP", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📱 Login with Phone</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter phone number (+84...)"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      <TouchableOpacity
        style={[styles.btn, loading && { opacity: 0.6 }]}
        onPress={handleSendOTP}
        disabled={loading}
      >
        <Text style={styles.btnText}>
          {loading ? "Sending OTP..." : "Send OTP"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6FDF3",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#064E3B",
    marginBottom: 24,
  },
  input: {
    backgroundColor: "#fff",
    width: "80%",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 16,
  },
  btn: {
    backgroundColor: "#10B981",
    width: "80%",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

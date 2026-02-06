import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { getUserProfile, BASE_URL } from "../src/services/userService";
import auth from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
export default function AccountScreen() {
  const navigation: any = useNavigation();
  const [user, setUser] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [])
  );

  const loadUser = async () => {
    try {
      const u = await getUserProfile();
      setUser(u);
    } catch (err: any) {
      Alert.alert("Lỗi", "Không tải được thông tin tài khoản");
    }
  };

  if (!user) return null;

  const handleLogout = async () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đồng ý",
        style: "destructive",
        onPress: async () => {
          try {
            await auth().signOut();
            try { await GoogleSignin.signOut(); } catch (e) {} 
            
          } catch (e: any) {
            Alert.alert("Lỗi đăng xuất", e.message);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* ===== PROFILE CARD ===== */}
      <TouchableOpacity
        style={styles.profileCard}
        onPress={() =>
            navigation.navigate("Account", {
                screen: "ProfileDetail",
            })}
      >
        <Image
          source={
            user.image
              ? { uri: `${BASE_URL}${user.image}` }
              : require("../assets/avatar.png")
          }
          style={styles.avatar}
        /> 

        <View style={{ marginLeft: 12 }}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.roleBadge}>{user.role.toUpperCase()}</Text>
          
        </View>
      </TouchableOpacity>

      {/* ===== ACTIONS ===== */}
      <View style={styles.block}>
        <TouchableOpacity style={styles.row}>
          <Text style={styles.rowText}>📞 Liên hệ</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.row}>
          <Text style={styles.rowText}>🎥 Video</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.block}>
        <TouchableOpacity style={styles.row}>
          <Text style={styles.rowText}>⚙️ Cài đặt</Text>
        </TouchableOpacity>
      </View>

      {/* ===== LOGOUT ===== */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>⟲ Đăng xuất</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Phiên bản 1.0.0</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6FDF3",
    padding: 16,
  },

  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#E5E7EB",
  },

  name: {
    fontSize: 18,
    fontWeight: "700",
  },

  sub: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },

  block: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
  },

  row: {
    padding: 14,
    borderBottomWidth: 1,
    borderColor: "#F3F4F6",
  },

  rowText: {
    fontSize: 15,
  },

  logoutBtn: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginTop: 10,
  },

  logoutText: {
    color: "#DC2626",
    fontWeight: "700",
  },

  version: {
    textAlign: "center",
    marginTop: 20,
    color: "#9CA3AF",
    fontSize: 12,
  },
    roleBadge: {
    marginTop: 4,
    fontSize: 12,
    color: "#10B981",
    fontWeight: "600",
  },
});

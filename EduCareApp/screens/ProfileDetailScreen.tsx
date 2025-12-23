import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import { useNavigation } from "@react-navigation/native";
import {
  getUserProfile,
  updateUserProfile,
  BASE_URL,
} from "../src/services/userService";

export default function ProfileDetailScreen() {
  const navigation: any = useNavigation();

  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    console.log("👉 ProfileDetail mounted");
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const u = await getUserProfile();
      setUser(u);
      setName(u.name || "");
      setPhone(u.phone || "");
    } catch {
      Alert.alert("Lỗi", "Không tải được hồ sơ");
    }
  };

  const pickImage = async () => {
    const res = await launchImageLibrary({ mediaType: "photo" });
    if (!res.assets?.[0]) return;

    const a = res.assets[0];
    setImage({
      uri: a.uri,
      type: a.type || "image/jpeg",
      name: a.fileName || "avatar.jpg",
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const fd = new FormData();
      fd.append("name", name);
      fd.append("phone", phone);
      if (image) fd.append("image", image);

      await updateUserProfile(fd);

      Alert.alert("✅ Thành công", "Cập nhật hồ sơ thành công");
      navigation.goBack();
    } catch (err: any) {
      Alert.alert("❌ Lỗi", err.message || "Không thể cập nhật");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <ScrollView style={styles.container}>
      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hồ sơ cá nhân</Text>
      </View>

      {/* ===== AVATAR ===== */}
      <TouchableOpacity style={styles.avatarWrap} onPress={pickImage}>
        <Image
          source={
            image
              ? { uri: image.uri }
              : user.image
              ? { uri: `${BASE_URL}${user.image}` }
              : require("../assets/avatar.png")
          }
          style={styles.avatar}
        />
        <Text style={styles.changeText}>Thay ảnh</Text>
      </TouchableOpacity>

      {/* ===== INFO ===== */}
      <View style={styles.card}>
        <Text style={styles.label}>Họ tên</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Số điện thoại</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Email</Text>
        <Text style={styles.readonly}>{user.email}</Text>
      </View>

      {/* ===== SAVE ===== */}
      <TouchableOpacity
        style={[styles.saveBtn, saving && { opacity: 0.6 }]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveText}>💾 Save</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6FDF3",
    padding: 16,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  back: {
    fontSize: 20,
    marginRight: 10,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },

  avatarWrap: {
    alignItems: "center",
    marginBottom: 20,
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E5E7EB",
  },

  changeText: {
    marginTop: 8,
    color: "#2563EB",
    fontWeight: "600",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
  },

  label: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 10,
  },

  input: {
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 6,
    fontSize: 15,
  },

  readonly: {
    marginTop: 6,
    fontSize: 15,
    color: "#374151",
  },

  saveBtn: {
    backgroundColor: "#10B981",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },

  saveText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
});

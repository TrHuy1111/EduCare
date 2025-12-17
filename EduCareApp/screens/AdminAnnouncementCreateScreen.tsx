import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { createAnnouncement } from "../src/services/announcementService";

export default function AdminAnnouncementCreateScreen({ navigation }: any) {
  const [form, setForm] = useState({
    title: "",
    content: "",
    location: "",
    startTime: new Date(),
    endTime: new Date(),
    image: null as any,
  });

  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);

  const pickImage = async () => {
    const res = await launchImageLibrary({ mediaType: "photo" });
    if (!res.assets?.[0]) return;

    const a = res.assets[0];
    setForm({
      ...form,
      image: {
        uri: a.uri,
        type: a.type || "image/jpeg",
        name: a.fileName || "announcement.jpg",
      },
    });
  };

  const handleSave = async () => {
    if (!form.title || !form.content) {
      return Alert.alert("Thiếu thông tin", "Nhập tiêu đề và nội dung");
    }

    if (form.endTime <= form.startTime) {
      return Alert.alert(
        "Thời gian không hợp lệ",
        "Thời gian kết thúc phải sau thời gian bắt đầu"
      );
    }

    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("content", form.content);
      fd.append("location", form.location);
      fd.append("startTime", form.startTime.toISOString());
      fd.append("endTime", form.endTime.toISOString());

      if (form.image) {
        fd.append("image", form.image as any);
      }

      await createAnnouncement(fd);
      Alert.alert("✅ Thành công", "Đã tạo sự kiện");
      navigation.goBack();
    } catch (err: any) {
      Alert.alert("❌ Lỗi", err.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>➕ Tạo sự kiện</Text>

      {/* IMAGE */}
      <TouchableOpacity style={styles.imageBox} onPress={pickImage}>
        {form.image ? (
          <Image source={{ uri: form.image.uri }} style={styles.image} />
        ) : (
          <Text style={styles.imageText}>Chọn ảnh sự kiện 📷</Text>
        )}
      </TouchableOpacity>

      {/* TITLE */}
      <Text style={styles.label}>Tiêu đề</Text>
      <TextInput
        style={styles.input}
        value={form.title}
        onChangeText={(t) => setForm({ ...form, title: t })}
      />

      {/* CONTENT */}
      <Text style={styles.label}>Nội dung</Text>
      <TextInput
        style={[styles.input, { height: 120 }]}
        multiline
        value={form.content}
        onChangeText={(t) => setForm({ ...form, content: t })}
      />

      {/* LOCATION */}
      <Text style={styles.label}>Địa điểm</Text>
      <TextInput
        style={styles.input}
        value={form.location}
        onChangeText={(t) => setForm({ ...form, location: t })}
      />

      {/* START */}
      <Text style={styles.label}>Ngày bắt đầu</Text>
      <TouchableOpacity
        style={styles.timeBtn}
        onPress={() => setShowStart(true)}
      >
        <Text>📅 {form.startTime.toLocaleDateString("vi-VN")}</Text>
      </TouchableOpacity>

      {showStart && (
        <DateTimePicker
          value={form.startTime}
          mode="date"
          display="default"
          onChange={(e, date) => {
            setShowStart(false);
            if (date) setForm({ ...form, startTime: date });
          }}
        />
      )}

      {/* END */}
      <Text style={styles.label}>Ngày kết thúc</Text>
      <TouchableOpacity
        style={styles.timeBtn}
        onPress={() => setShowEnd(true)}
      >
        <Text>📅 {form.endTime.toLocaleDateString("vi-VN")}</Text>
      </TouchableOpacity>

      {showEnd && (
        <DateTimePicker
          value={form.endTime}
          mode="date"
          display="default"
          onChange={(e, date) => {
            setShowEnd(false);
            if (date) setForm({ ...form, endTime: date });
          }}
        />
      )}


      {/* SAVE */}
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveText}>💾 Lưu sự kiện</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E6FDF3", padding: 16 },
  header: {
    fontSize: 22,
    fontWeight: "700",
    color: "#064E3B",
    marginBottom: 16,
  },
  label: { fontWeight: "600", marginBottom: 6, color: "#064E3B" },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 12,
  },
  imageBox: {
    height: 160,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 16,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  image: { width: "100%", height: "100%" },
  imageText: { color: "#6b7280" },
  timeBtn: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 12,
  },
  saveBtn: {
    backgroundColor: "#10B981",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  saveText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});

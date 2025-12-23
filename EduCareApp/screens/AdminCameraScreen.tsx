import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import Video from "react-native-video";

import {
  getAllClasses,
  uploadClassCamera,
} from "../src/services/classService";

export default function AdminCameraScreen() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [video, setVideo] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const res = await getAllClasses();
      setClasses(res.data || []);
    } catch {
      Alert.alert("Lỗi", "Không tải được danh sách lớp");
    }
  };

  // 🎥 Chọn video CCTV (giả lập)
  const pickVideo = async () => {
    const res = await launchImageLibrary({
      mediaType: "video",
    });

    if (!res.assets?.[0]) return;

    const v = res.assets[0];
    setVideo({
      uri: v.uri,
      type: v.type || "video/mp4",
      name: v.fileName || "camera.mp4",
    });
  };

  // 💾 Lưu camera
  const handleSave = async () => {
    if (!selectedClass) {
      return Alert.alert("Thiếu thông tin", "Vui lòng chọn lớp");
    }
    if (!video) {
      return Alert.alert("Thiếu video", "Vui lòng chọn video camera");
    }

    try {
      setSaving(true);
      await uploadClassCamera(selectedClass._id, video);
      Alert.alert("✅ Thành công", "Đã cập nhật camera cho lớp");
      setVideo(null);
    } catch (err: any) {
      Alert.alert("❌ Lỗi", err.message || "Không thể lưu camera");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📹 Quản lý camera lớp học</Text>

      {/* ===== CLASS LIST ===== */}
      <Text style={styles.label}>Chọn lớp</Text>
      <FlatList
        data={classes}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.classItem,
              selectedClass?._id === item._id && styles.classActive,
            ]}
            onPress={() => setSelectedClass(item)}
          >
            <Text
              style={[
                styles.classText,
                selectedClass?._id === item._id && { color: "#fff" },
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* ===== VIDEO PICKER ===== */}
      <TouchableOpacity style={styles.pickBtn} onPress={pickVideo}>
        <Text style={styles.pickText}>
          {video ? "🎬 Đổi video camera" : "➕ Chọn video camera"}
        </Text>
      </TouchableOpacity>

      {/* ===== PREVIEW ===== */}
      {video && (
      <View style={styles.previewBox}>
        <Video
          source={{ uri: video.uri }}
          style={{ width: "100%", height: "100%" }}
          controls
          resizeMode="contain"
          paused={false}
        />
      </View>
    )}

      {/* ===== SAVE ===== */}
      <TouchableOpacity
        style={[styles.saveBtn, saving && { opacity: 0.6 }]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveText}>💾 Lưu camera</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6FDF3",
    padding: 16,
  },

  header: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },

  classItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "#E5E7EB",
    borderRadius: 20,
    marginRight: 10,
  },

  classActive: {
    backgroundColor: "#10B981",
  },

  classText: {
    fontWeight: "600",
  },

  pickBtn: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 12,
    marginVertical: 16,
    alignItems: "center",
  },

  pickText: {
    fontWeight: "700",
    color: "#2563EB",
  },

  previewBox: {
    height: 220,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#000",
    marginBottom: 16,
  },

  saveBtn: {
    backgroundColor: "#10B981",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  saveText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});

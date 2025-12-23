import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Video from "react-native-video";

import { getMyChildren } from "../src/services/studentService";
import { getClassCamera, BASE_URL } from "../src/services/classService";

export default function ParentCameraScreen() {
  const [children, setChildren] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [camera, setCamera] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  /* ===== LOAD CHILDREN ===== */
  const loadChildren = async () => {
    try {
      const res = await getMyChildren();
      setChildren(res.data || []);

      if (res.data.length === 1) {
        setSelectedStudent(res.data[0]._id);
      }
    } catch {
      Alert.alert("Lỗi", "Không tải được danh sách con");
    } finally {
      setLoading(false);
    }
  };

  /* ===== LOAD CAMERA ===== */
  const loadCamera = async (studentId: string) => {
    try {
      setLoading(true);
      const student = children.find((c) => c._id === studentId);

      if (!student?.classId?._id) {
        return Alert.alert("Thông báo", "Học sinh chưa được xếp lớp");
      }

      const res = await getClassCamera(student.classId._id);
      setCamera(res.data);
    } catch (err: any) {
      setCamera(null);
      Alert.alert("📹 Camera", err.response?.data?.message || "Không có camera");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChildren();
  }, []);

  useEffect(() => {
    if (selectedStudent && children.length > 0) {
      loadCamera(selectedStudent);
    }
  }, [selectedStudent]);

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 60 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📹 Camera lớp học</Text>

      {/* ===== SELECT STUDENT ===== */}
      {children.length > 1 && (
        <View style={styles.card}>
          <Text style={styles.label}>Chọn con</Text>
          <Picker
            selectedValue={selectedStudent}
            onValueChange={(v) => setSelectedStudent(v)}
          >
            <Picker.Item label="-- Chọn học sinh --" value={null} />
            {children.map((c) => (
              <Picker.Item
                key={c._id}
                label={`${c.name} (${c.classId?.name || "Chưa có lớp"})`}
                value={c._id}
              />
            ))}
          </Picker>
        </View>
      )}

      {/* ===== CAMERA ===== */}
      {!camera ? (
        <Text style={styles.empty}>🚫 Lớp hiện chưa có camera</Text>
      ) : (
        <View style={styles.videoBox}>
          <Text style={styles.className}>{camera.className}</Text>

          <Video
            source={{ uri: `${BASE_URL}${camera.cameraUrl}` }}
            style={styles.video}
            controls
            resizeMode="contain"
            />

          <Text style={styles.live}>🔴 LIVE</Text>
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6FDF3",
    padding: 16,
  },

  title: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 16,
  },

  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },

  label: {
    fontWeight: "600",
    marginBottom: 6,
  },

  empty: {
    textAlign: "center",
    marginTop: 60,
    color: "#6B7280",
  },

  videoBox: {
    backgroundColor: "#000",
    borderRadius: 12,
    overflow: "hidden",
  },

  video: {
    width: "100%",
    height: 240,
  },

  className: {
    color: "#fff",
    padding: 10,
    fontWeight: "700",
  },

  live: {
    color: "red",
    textAlign: "right",
    padding: 8,
    fontWeight: "800",
  },
});

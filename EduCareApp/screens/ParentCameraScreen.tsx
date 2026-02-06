// screens/ParentCameraScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Image,
  ScrollView,
  FlatList,
  Dimensions
} from "react-native";
import Video from "react-native-video";
import { useNavigation } from "@react-navigation/native";

import { getMyChildren } from "../src/services/studentService";
import { getClassCamera, BASE_URL } from "../src/services/classService";

const { width } = Dimensions.get("window");

export default function ParentCameraScreen() {
  const navigation = useNavigation();
  const [children, setChildren] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null); // Lưu cả object student
  const [camera, setCamera] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingCamera, setLoadingCamera] = useState(false);

  /* ===== LOAD CHILDREN ===== */
  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      const res = await getMyChildren();
      const list = res.data || [];
      setChildren(list);

      if (list.length > 0) {
        handleSelectStudent(list[0]); // Mặc định chọn bé đầu tiên
      }
    } catch {
      Alert.alert("Lỗi", "Không tải được danh sách con");
    } finally {
      setLoading(false);
    }
  };

  /* ===== HANDLE SELECT STUDENT ===== */
  const handleSelectStudent = async (student: any) => {
    setSelectedStudent(student);
    loadCamera(student);
  };

  const loadCamera = async (student: any) => {
    try {
      setLoadingCamera(true);
      
      // Check xem bé có lớp chưa
      if (!student.classId || !student.classId._id) {
        setCamera(null);
        return;
      }

      const res = await getClassCamera(student.classId._id);
      setCamera(res.data);
    } catch (err: any) {
      setCamera(null);
      // Không cần alert lỗi ở đây, chỉ cần set null để hiện giao diện "No Signal"
    } finally {
      setLoadingCamera(false);
    }
  };

  /* ===== RENDER CHILD ITEM (AVATAR) ===== */
  const renderChildItem = ({ item }: any) => {
    const isSelected = selectedStudent?._id === item._id;
    return (
      <TouchableOpacity 
        style={styles.childItem} 
        onPress={() => handleSelectStudent(item)}
        activeOpacity={0.8}
      >
        <View style={[styles.avatarBorder, isSelected && styles.avatarActive]}>
          <Image
            source={
              item.avatar
                ? { uri: item.avatar }
                : require("../assets/icons/student.png") // Nhớ check path icon
            }
            style={styles.avatar}
          />
        </View>
        <Text style={[styles.childName, isSelected && styles.nameActive]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerLoading}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* 1. CHILDREN SELECTOR (Horizontal) */}
        <View style={styles.selectorContainer}>
          <Text style={styles.sectionLabel}>Con của bạn</Text>
          <FlatList
            data={children}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item._id}
            renderItem={renderChildItem}
            contentContainerStyle={{ paddingHorizontal: 4 }}
          />
        </View>

        {/* 2. CAMERA MONITOR */}
        <View style={styles.monitorContainer}>
          <View style={styles.screenFrame}>
            {loadingCamera ? (
                <View style={styles.loadingScreen}>
                    <ActivityIndicator color="#10B981" />
                    <Text style={{color: '#fff', marginTop: 8}}>Đang kết nối camera...</Text>
                </View>
            ) : camera ? (
              <>
                <Video
                  source={{ uri: `${BASE_URL}${camera.cameraUrl}` }}
                  style={styles.video}
                  controls={true}
                  resizeMode="contain"
                  paused={false}
                  onError={(e) => console.log("Video Error:", e)}
                />
                {/* Overlay Badge */}
                <View style={styles.liveBadge}>
                  <View style={styles.redDot} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              </>
            ) : (
              <View style={styles.noSignalScreen}>
                <Text style={styles.noSignalIcon}>🚫</Text>
                <Text style={styles.noSignalText}>NO SIGNAL</Text>
                <Text style={styles.noSignalSub}>
                   {selectedStudent?.classId 
                      ? "Lớp này chưa lắp đặt Camera" 
                      : "Bé chưa được xếp lớp"}
                </Text>
              </View>
            )}
          </View>
          
          {/* Monitor Footer Info */}
          <View style={styles.monitorFooter}>
             <Text style={styles.cameraName}>
                📷 {camera ? camera.className : "Camera Offline"}
             </Text>
             {camera && <Text style={styles.statusOnline}>● Online</Text>}
          </View>
        </View>

        {/* 3. CLASS INFO CARD (Thông tin bổ sung) */}
        {selectedStudent?.classId && (
            <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Thông tin lớp học</Text>
                
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Lớp:</Text>
                    <Text style={styles.infoValue}>{selectedStudent.classId.name}</Text>
                </View>
                
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Cấp độ:</Text>
                    <Text style={styles.infoValue}>{selectedStudent.classId.level}</Text>
                </View>

                {/* Nếu bạn populate giáo viên thì hiện ở đây, tạm thời để static */}
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Giáo viên:</Text>
                    <Text style={styles.infoValue}>Xem trong chi tiết lớp</Text>
                </View>
            </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E6FDF3" },
  centerLoading: { flex: 1, justifyContent: "center", alignItems: "center" },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#E6FDF3'
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#064E3B' },

  // SELECTOR STYLE
  selectorContainer: { paddingHorizontal: 16, marginBottom: 20 },
  sectionLabel: { fontSize: 14, fontWeight: "600", color: "#065F46", marginBottom: 10 },
  childItem: { alignItems: "center", marginRight: 20 },
  avatarBorder: {
    width: 64, height: 64, borderRadius: 32,
    borderWidth: 2, borderColor: "#D1D5DB", // Gray border inactive
    padding: 2,
    justifyContent: 'center', alignItems: 'center'
  },
  avatarActive: {
    borderColor: "#10B981", // Green border active
    borderWidth: 3,
  },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#eee' },
  childName: { marginTop: 6, fontSize: 12, fontWeight: "600", color: "#6B7280" },
  nameActive: { color: "#10B981", fontWeight: "700" },

  // MONITOR STYLE
  monitorContainer: {
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 10,
    elevation: 4,
    shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 6,
    marginBottom: 20
  },
  screenFrame: {
    width: "100%",
    height: 220,
    backgroundColor: "#000",
    borderRadius: 12,
    overflow: "hidden",
    position: 'relative',
    justifyContent: 'center'
  },
  video: { width: "100%", height: "100%" },
  
  // LIVE BADGE
  liveBadge: {
    position: "absolute",
    top: 12, left: 12,
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 4
  },
  redDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: "#EF4444",
    marginRight: 6
  },
  liveText: { color: "#fff", fontSize: 10, fontWeight: "800", letterSpacing: 1 },

  // NO SIGNAL & LOADING
  noSignalScreen: { alignItems: 'center', justifyContent: 'center' },
  noSignalIcon: { fontSize: 40, marginBottom: 8 },
  noSignalText: { color: "#6B7280", fontWeight: "800", fontSize: 18, letterSpacing: 2 },
  noSignalSub: { color: "#9CA3AF", fontSize: 12, marginTop: 4 },
  loadingScreen: { alignItems: 'center', justifyContent: 'center' },

  monitorFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 12, paddingHorizontal: 4
  },
  cameraName: { fontWeight: "700", color: "#374151", fontSize: 15 },
  statusOnline: { color: "#10B981", fontSize: 12, fontWeight: "600" },

  // INFO CARD
  infoCard: {
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    marginBottom: 30
  },
  infoTitle: { fontSize: 16, fontWeight: "bold", color: "#064E3B", marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingBottom: 8 },
  infoRow: { flexDirection: 'row', marginBottom: 8 },
  infoLabel: { width: 80, color: '#666', fontWeight: '500' },
  infoValue: { flex: 1, fontWeight: '600', color: '#333' }
});
// screens/AdminCameraScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Image,
  Dimensions,
  ScrollView
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import Video from "react-native-video";
import { useNavigation } from "@react-navigation/native"; // Nếu cần nút back

import {
  getAllClasses,
  uploadClassCamera,
  BASE_URL, // Import BASE_URL để load video từ server
} from "../src/services/classService";

const { width } = Dimensions.get("window");
const COLUMN_WIDTH = (width - 48) / 2; // Trừ padding để chia 2 cột

export default function AdminCameraScreen() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  
  // videoLocal: Video vừa chọn từ thư viện (để chuẩn bị upload)
  const [videoLocal, setVideoLocal] = useState<any>(null);
  
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

  const handleSelectClass = (item: any) => {
    setSelectedClass(item);
    setVideoLocal(null); // Reset video local khi đổi lớp
  };

  // 🎥 Chọn video mới từ thư viện
  const pickVideo = async () => {
    const res = await launchImageLibrary({
      mediaType: "video",
    });

    if (!res.assets?.[0]) return;

    const v = res.assets[0];
    setVideoLocal({
      uri: v.uri,
      type: v.type || "video/mp4",
      name: v.fileName || "camera.mp4",
    });
  };

  // 💾 Upload video lên Server
  const handleSave = async () => {
    if (!selectedClass || !videoLocal) return;

    try {
      setSaving(true);
      await uploadClassCamera(selectedClass._id, videoLocal);
      
      Alert.alert("✅ Thành công", `Đã cập nhật camera cho lớp ${selectedClass.name}`);
      
      // Reload lại danh sách để cập nhật trạng thái mới (có cameraUrl)
      await loadClasses();
      
      // Update lại selectedClass với data mới
      const updatedList = await getAllClasses();
      const updatedClass = updatedList.data.find((c: any) => c._id === selectedClass._id);
      setSelectedClass(updatedClass);
      setVideoLocal(null);

    } catch (err: any) {
      Alert.alert("❌ Lỗi", err.message || "Không thể lưu camera");
    } finally {
      setSaving(false);
    }
  };

  // --- RENDER ITEM (Mỗi lớp là 1 màn hình CCTV nhỏ) ---
  const renderClassItem = ({ item }: any) => {
    const hasCamera = !!item.cameraUrl; // Check xem lớp đã có video chưa
    const isSelected = selectedClass?._id === item._id;

    return (
      <TouchableOpacity
        style={[
          styles.gridItem,
          isSelected && styles.gridItemActive, // Viền xanh nếu đang chọn
        ]}
        onPress={() => handleSelectClass(item)}
      >
        {/* Màn hình giả lập */}
        <View style={[styles.screenPlaceholder, hasCamera ? styles.bgActive : styles.bgInactive]}>
            {hasCamera ? (
                 <Text style={styles.iconCamera}>📹</Text>
            ) : (
                 <Text style={styles.iconCamera}>🚫</Text>
            )}
        </View>

        {/* Thông tin lớp */}
        <View style={styles.infoRow}>
            <Text style={styles.className} numberOfLines={1}>{item.name}</Text>
            {hasCamera ? (
                <View style={styles.badgeActive}><Text style={styles.badgeText}>LIVE</Text></View>
            ) : (
                <View style={styles.badgeInactive}><Text style={styles.badgeText}>OFF</Text></View>
            )}
        </View>
      </TouchableOpacity>
    );
  };

  // --- RENDER PREVIEW AREA (Khu vực xem/sửa) ---
  const renderPreviewSection = () => {
    if (!selectedClass) return (
        <View style={styles.emptyState}>
            <Text style={styles.emptyText}>👆 Chọn một lớp để quản lý Camera</Text>
        </View>
    );

    // Nguồn video: Ưu tiên video vừa chọn (Local), nếu không thì lấy video Server
    const videoSource = videoLocal 
        ? { uri: videoLocal.uri } 
        : (selectedClass.cameraUrl ? { uri: `${BASE_URL}${selectedClass.cameraUrl}` } : null);

    return (
      <View style={styles.previewContainer}>
        <Text style={styles.sectionTitle}>
            📺 Camera: {selectedClass.name}
        </Text>

        <View style={styles.videoWrapper}>
            {videoSource ? (
                <Video
                    source={videoSource}
                    style={styles.videoPlayer}
                    controls
                    resizeMode="contain"
                    paused={true} // Tự động pause để đỡ ồn
                />
            ) : (
                <View style={styles.noSignalBox}>
                    <Text style={styles.noSignalText}>NO SIGNAL</Text>
                    <Text style={{color:'#666', marginTop: 8}}>Lớp này chưa có Camera</Text>
                </View>
            )}
            
            {/* Nhãn báo đang xem video local chưa lưu */}
            {videoLocal && (
                <View style={styles.unsavedBadge}>
                    <Text style={{color:'white', fontWeight:'bold', fontSize: 10}}>PREVIEW (Chưa lưu)</Text>
                </View>
            )}
        </View>

        <View style={styles.actionRow}>
            <TouchableOpacity style={styles.uploadBtn} onPress={pickVideo}>
                <Text style={styles.btnText}>
                    {selectedClass.cameraUrl || videoLocal ? "🔄 Thay thế Video" : "➕ Tải Video Lên"}
                </Text>
            </TouchableOpacity>

            {videoLocal && (
                <TouchableOpacity 
                    style={[styles.saveBtn, saving && {opacity: 0.7}]} 
                    onPress={handleSave}
                    disabled={saving}
                >
                    <Text style={[styles.btnText, {color: '#fff'}]}>
                        {saving ? "⏳ Đang lưu..." : "💾 Lưu ngay"}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.header}>📡 Trung tâm giám sát</Text>
      
      {/* DANH SÁCH LỚP (GRID) */}
      <View>
        <FlatList
            data={classes}
            keyExtractor={(item) => item._id}
            renderItem={renderClassItem}
            numColumns={2} // Chia 2 cột
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            scrollEnabled={false} // Để ScrollView bên ngoài lo
        />
      </View>

      <View style={styles.divider}/>

      {/* KHUV VỰC CHI TIẾT */}
      {renderPreviewSection()}
      
      <View style={{height: 40}}/>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E6FDF3", padding: 16 },
  header: { fontSize: 22, fontWeight: "800", color: "#064E3B", marginBottom: 16 },
  divider: { height: 1, backgroundColor: "#A7F3D0", marginVertical: 20 },

  // GRID ITEM
  gridItem: {
    width: COLUMN_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    padding: 8,
    borderWidth: 2,
    borderColor: "transparent",
    elevation: 2,
  },
  gridItemActive: {
    borderColor: "#10B981", // Viền xanh khi chọn
    backgroundColor: "#ECFDF5"
  },
  screenPlaceholder: {
    height: 80,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  bgActive: { backgroundColor: "#D1FAE5" }, // Xanh nhạt
  bgInactive: { backgroundColor: "#F3F4F6" }, // Xám
  iconCamera: { fontSize: 24 },
  
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  className: { fontWeight: '700', fontSize: 13, flex: 1, color: '#333' },
  
  badgeActive: { backgroundColor: "#10B981", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeInactive: { backgroundColor: "#9CA3AF", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "bold" },

  // PREVIEW SECTION
  previewContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 4, 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 20,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#064E3B", marginBottom: 12 },
  videoWrapper: {
    width: '100%',
    height: 220,
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
    position: 'relative'
  },
  videoPlayer: { width: '100%', height: '100%' },
  
  noSignalBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  noSignalText: { color: '#EF4444', fontWeight: '900', fontSize: 24, letterSpacing: 2 },

  unsavedBadge: {
    position: 'absolute', top: 10, right: 10, backgroundColor: '#F59E0B',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, zIndex: 10
  },

  actionRow: { flexDirection: 'row', marginTop: 16, gap: 10 },
  uploadBtn: {
    flex: 1, backgroundColor: "#fff", padding: 12, borderRadius: 10,
    alignItems: 'center', borderWidth: 1, borderColor: '#10B981'
  },
  saveBtn: {
    flex: 1, backgroundColor: "#10B981", padding: 12, borderRadius: 10,
    alignItems: 'center'
  },
  btnText: { fontWeight: "700", color: "#064E3B" },
  
  emptyState: { alignItems: 'center', padding: 20, opacity: 0.6 },
  emptyText: { fontSize: 16, color: '#064E3B' }
});
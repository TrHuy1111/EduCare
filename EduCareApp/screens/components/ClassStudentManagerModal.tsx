// screens/components/ClassStudentManagerModal.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Image, 
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { getWaitingStudents } from "../../src/services/studentService";
import {
  enrollStudentToClass,
  removeStudentFromClass,
} from "../../src/services/classService";

interface Props {
  visible: boolean;
  onClose: () => void;
  classData: any;
  onUpdate: () => void;
}

export default function ClassStudentManagerModal({
  visible,
  onClose,
  classData,
  onUpdate,
}: Props) {
  const [waitingList, setWaitingList] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [loading, setLoading] = useState(false);
  
  const currentSize = classData?.students?.length || 0;
  const maxSize = classData?.maxStudents || 0;
  const isFull = currentSize >= maxSize;
  useEffect(() => {
    if (visible && classData) {
      loadWaitingList();
    }
  }, [visible, classData]);

  const loadWaitingList = async () => {
    try {
      const res = await getWaitingStudents(classData.level);
      setWaitingList(res.data);
    } catch (err) {
      console.log("Lỗi load waiting list", err);
    }
  };

  const handleEnroll = async () => {
    if (!selectedStudentId) return Alert.alert("Chưa chọn học sinh");
    try {
      setLoading(true);
      await enrollStudentToClass(classData._id, selectedStudentId);
      Alert.alert("✅ Thành công", "Đã thêm học sinh vào lớp");
      
      setSelectedStudentId("");
      loadWaitingList();
      onUpdate();
    } catch (err: any) {
      Alert.alert("❌ Lỗi", err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (studentId: string) => {
    Alert.alert("Xác nhận", "Đưa học sinh này ra khỏi lớp?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đồng ý",
        onPress: async () => {
          try {
            setLoading(true);
            await removeStudentFromClass(classData._id, studentId);
            onUpdate();
          } catch (err: any) {
            Alert.alert("❌ Lỗi", err.message);
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  // 👇 RENDER ITEM MỚI (Giống AttendanceScreen)
  const renderStudentItem = ({ item }: any) => {
    return (
      <View style={styles.studentRow}>
        {/* Avatar */}
        <Image
          source={
            item.avatar
              ? { uri: item.avatar }
              : require("../../assets/icons/student.png") // Đảm bảo đường dẫn đúng
          }
          style={styles.avatar}
        />

        {/* Tên học sinh */}
        <View style={{ flex: 1 }}>
          <Text style={styles.studentName}>{item.name}</Text>
          {item.gender && (
            <Text style={{ fontSize: 12, color: "#666" }}>
              {item.gender === "male" ? "Nam" : "Nữ"}
            </Text>
          )}
        </View>

        {/* Nút Xóa */}
        <TouchableOpacity 
            style={styles.deleteBtn}
            onPress={() => handleRemove(item._id)}
        >
          <Text style={styles.deleteText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBg}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>👶 Lớp {classData?.name}</Text>
          <Text style={{ marginBottom: 15, color: "#064E3B", textAlign: "center" }}>
            Sĩ số:{" "}
            <Text style={{ fontWeight: "bold", color: isFull ? "red" : "#064E3B" }}>
              {currentSize}/{maxSize}
            </Text>
            {isFull && <Text style={{ color: "red", fontWeight: "bold" }}> (Đã đầy)</Text>}
          </Text>

          {/* 1. KHUNG THÊM HỌC SINH */}
          <View style={styles.enrollBox}>
            <Text style={{ fontWeight: "bold", marginBottom: 8, color: "#065F46" }}>
              ➕ Thêm từ danh sách chờ ({classData?.level}):
            </Text>
            
            {waitingList.length === 0 ? (
              <Text style={{ fontStyle: "italic", color: "#888", marginBottom: 5 }}>
                (Trống)
              </Text>
            ) : (
              <View style={styles.pickerRow}>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedStudentId}
                    onValueChange={(v) => setSelectedStudentId(v)}
                    style={{ height: 55 }}
                    enabled={!isFull} // Disable picker nếu đầy (tuỳ chọn)
                  >
                    <Picker.Item label="-- Chọn bé --" value="" />
                    {waitingList.map((s) => (
                      <Picker.Item
                        key={s._id}
                        label={`${s.name} (${new Date(s.dob).getFullYear()})`}
                        value={s._id}
                      />
                    ))}
                  </Picker>
                </View>

                {/*2. Cập nhật nút ADD: Disable nếu Full */}
                <TouchableOpacity
                  style={[
                    styles.addIconBtn,
                    (loading || isFull) && { backgroundColor: "#ccc" }, // Đổi màu xám
                  ]}
                  onPress={handleEnroll}
                  disabled={loading || isFull} // Chặn bấm
                >
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>
                    {isFull ? "FULL" : "ADD"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            
            {/* Hiển thị dòng cảnh báo nếu đầy */}
            {isFull && waitingList.length > 0 && (
               <Text style={{color: 'red', fontSize: 11, marginTop: 5, fontStyle: 'italic'}}>
                 * Lớp đã đạt sĩ số tối đa, không thể thêm mới.
               </Text>
            )}
          </View>

          {/* 2. DANH SÁCH HIỆN TẠI */}
          <View style={styles.listHeader}>
             <Text style={styles.label}>Danh sách lớp ({classData?.students?.length} bé):</Text>
          </View>
          
          <FlatList
            data={classData?.students || []}
            keyExtractor={(item) => item._id}
            style={{ maxHeight: 350 }} 
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={renderStudentItem} // Sử dụng hàm render mới
            ListEmptyComponent={
                <Text style={{textAlign: 'center', marginTop: 20, color: '#999'}}>Lớp chưa có học sinh nào.</Text>
            }
          />

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={{ color: "#fff", fontWeight: "bold" }}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBg: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)", // Làm tối nền hơn chút
  },
  modalBox: {
    backgroundColor: "#fff",
    width: "90%",
    height: "85%", // Tăng chiều cao
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#064E3B",
    textAlign: "center",
    marginBottom: 4,
  },
  
  enrollBox: {
    backgroundColor: "#E6FDF3", // Màu xanh nhẹ giống theme
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    marginBottom: 10,
  },
  pickerRow: { flexDirection: "row", gap: 8, alignItems: 'center' },
  pickerContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    backgroundColor: "#fff",
    height: 50,
    overflow: 'hidden',
    justifyContent: 'center'
  },
  addIconBtn: {
    backgroundColor: "#10B981",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  
  listHeader: {
    marginTop: 10,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 5
  },
  label: { fontWeight: "700", color: "#333", fontSize: 16 },

  // 👇 Styles mới cho Student Row (Giống Attendance)
  studentRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F6FA", // Màu nền xám nhạt
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#ddd' // Placeholder color
  },
  studentName: {
    fontWeight: "700",
    fontSize: 15,
    color: "#064E3B", // Màu xanh đậm
  },
  deleteBtn: {
    backgroundColor: "#FEE2E2",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#FECACA"
  },
  deleteText: {
    color: "#DC2626",
    fontWeight: "bold",
    fontSize: 12
  },

  closeBtn: {
    marginTop: 10,
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 30,
    backgroundColor: '#EF4444',
    borderRadius: 10
  },
});
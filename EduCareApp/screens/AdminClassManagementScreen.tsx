//screens/AdminClassManagementScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  Modal,
  StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import {
  getAllClasses,
  createClass,
  assignTeacherToClass,
  deleteClass,
  removeTeacherFromClass,
} from "../src/services/classService";
import { fetchTeachers } from "../src/services/userService";
import ClassStudentManagerModal from "./components/ClassStudentManagerModal";
// RULE giống backend
const CLASS_RULES: any = {
  infant: { minStudents: 5, maxStudents: 10, minTeachers: 2 },
  toddler: { minStudents: 10, maxStudents: 15, minTeachers: 2 },
  preK2: { minStudents: 15, maxStudents: 18, minTeachers: 1 },
  preK3: { minStudents: 18, maxStudents: 22, minTeachers: 1 },
  preK4: { minStudents: 20, maxStudents: 25, minTeachers: 1 },
  preK5: { minStudents: 20, maxStudents: 30, minTeachers: 1 },
};

export default function AdminClassManagementScreen() {
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<{ [key: string]: string }>({});
  const [showModal, setShowModal] = useState(false);
  const [newClass, setNewClass] = useState({
    name: "",
    level: "",
    description: "",
  });
  
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const currentClass = classes.find((c) => c._id === selectedClassId) || null;
  const showStudentModal = !!selectedClassId;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const resClass = await getAllClasses();
      const resTeacher = await fetchTeachers();
      setClasses(resClass.data);
      setTeachers(resTeacher);
    } catch (err: any) {
      console.log("❌ Lỗi loadData:", err.message);
      Alert.alert("❌ Lỗi", "Không thể tải dữ liệu lớp học!");
    }
  };

  // Tạo lớp mới
  const handleCreateClass = async () => {
    if (!newClass.name.trim() || !newClass.level.trim()) {
      Alert.alert("⚠️ Thiếu thông tin", "Vui lòng nhập đầy đủ TÊN LỚP và CẤP LỚP!");
      return;
    }

    try {
      await createClass({
        name: newClass.name.trim(),
        level: newClass.level.trim(),
        description: newClass.description.trim(),
      });

      Alert.alert("✅ Thành công", "Tạo lớp học thành công!");
      setShowModal(false);
      setNewClass({ name: "", level: "", description: "" });
      loadData();
    } catch (err: any) {
      console.log("❌ Lỗi tạo lớp:", err.response?.data || err.message);
      Alert.alert("❌ Lỗi", err.response?.data?.message || err.message);
    }
  };

  // Gán giáo viên vào lớp
  const handleAssignTeacher = async (classId: string) => {
    const teacherId = selectedTeacher[classId];
    if (!teacherId) {
      Alert.alert("⚠️ Chưa chọn giáo viên");
      return;
    }

    try {
      await assignTeacherToClass(classId, teacherId);
      Alert.alert("✅ Thành công", "Đã gán giáo viên vào lớp!");

      setSelectedTeacher((prev) => ({ ...prev, [classId]: "" }));
      loadData();
    } catch (err: any) {
      Alert.alert("❌ Lỗi", err.response?.data?.message || err.message);
    }
  };

  // Xóa lớp
  const handleDeleteClass = (classId: string) => {
  Alert.alert(
    "Xóa lớp?",
    "Bạn có chắc muốn xóa lớp này? Thao tác không thể hoàn tác.",
    [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteClass(classId);
            Alert.alert("✔ Đã xóa lớp");
            loadData();
          } catch (err: any) {
            Alert.alert("❌ Lỗi", err.response?.data?.message || err.message);
          }
        },
      },
    ]
  );
};
// Remove teacher from class
const handleRemoveTeacher = (classId: string, teacherId: string) => {
  Alert.alert(
    "Xóa giáo viên?",
    "Giáo viên này sẽ không còn thuộc lớp.",
    [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        onPress: async () => {
          try {
            await removeTeacherFromClass(classId, teacherId);
            Alert.alert("✔ Đã xóa giáo viên khỏi lớp");
            loadData();
          } catch (err: any) {
            Alert.alert("❌ Lỗi", err.response?.data?.message || err.message);
          }
        },
      },
    ]
  );
};

const handleOpenStudentManager = (item: any) => {
    setSelectedClassId(item._id); 
  };
  

  // UI cho từng lớp
  const renderClassItem = ({ item }: any) => {
    const teacherCount = item.teachers?.length || 0;
    const studentCount = item.students?.length || 0;

    const teacherOK = teacherCount >= item.minTeachers;
    const studentOK = studentCount <= item.maxStudents;

    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.deleteClassBtn}
          onPress={() => handleDeleteClass(item._id)}
        >
          <Text style={styles.deleteClassText}>🗑 Xóa lớp</Text>
        </TouchableOpacity>
        <Text style={styles.classTitle}>{item.name}</Text>
        <Text style={styles.level}>Cấp độ: {item.level}</Text>
        <Text style={styles.desc}>{item.description}</Text>

        {/* RULE status */}
        <View style={{ marginTop: 8 }}>
          <Text style={styles.ruleLabel}>👨‍🏫 Giáo viên:</Text>
          <Text
            style={[
              styles.ruleValue,
              { color: teacherCount >= item.minTeachers ? "#047857" : "#dc2626" },
            ]}
          >
            {teacherCount} / {item.minTeachers} giáo viên (tối thiểu)
          </Text>

          <Text style={styles.ruleLabel}>👶 Số học sinh:</Text>
            <Text
              style={[
                styles.ruleValue,
                { color: studentCount <= item.maxStudents ? "#047857" : "#dc2626" },
              ]}
            >
              {studentCount} / {item.maxStudents} học sinh (tối đa)
            </Text>
        </View>

        {/* Danh sách giáo viên */}
        <Text style={styles.label}>Giáo viên hiện tại:</Text>
          {item.teachers.length === 0 ? (
            <Text style={{ color: "#888", marginLeft: 10 }}>Chưa có giáo viên</Text>
          ) : (
            item.teachers.map((t: any) => (
              <View key={t._id} style={styles.teacherRow}>
                <Text style={styles.teacherInfo}>👩‍🏫 {t.name} ({t.email})</Text>

                <TouchableOpacity
                style={styles.deleteIconBtn}
                  onPress={() => handleRemoveTeacher(item._id, t._id)}
                >
                  <Text style={styles.removeTeacherBtn}>❌</Text>
                </TouchableOpacity>
              </View>
            ))
          )}

        {/* Assign teacher */}
        <View style={styles.assignBox}>
          <Picker
            selectedValue={selectedTeacher[item._id] || ""}
            onValueChange={(val) =>
              setSelectedTeacher((prev) => ({ ...prev, [item._id]: val }))
            }
            style={{ flex: 1 }}
          >
            <Picker.Item label="-- Chọn giáo viên để thêm --" value="" />
            {teachers.map((t) => (
              <Picker.Item key={t._id} label={`${t.name} (${t.email})`} value={t._id} />
            ))}
          </Picker>

          <TouchableOpacity
            style={styles.assignBtn}
            onPress={() => handleAssignTeacher(item._id)}
          >
            <Text style={styles.assignText}>➕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.studentSection}>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>👶 Học sinh ({item.students?.length || 0}/{item.maxStudents})</Text>
            <TouchableOpacity 
              style={styles.manageBtn}
              onPress={() => handleOpenStudentManager(item)}
            >
              <Text style={styles.manageBtnText}>📋 Quản lý HS</Text>
            </TouchableOpacity>
          </View>
          
          {/* Preview 3 học sinh đầu tiên (cho gọn) */}
          {item.students?.slice(0, 3).map((s: any) => (
             <Text key={s._id} style={{marginLeft: 10, color: '#555'}}>• {s.name}</Text>
          ))}
          {(item.students?.length > 3) && <Text style={{marginLeft: 10, color: '#888'}}>...</Text>}
        </View>    

      </View>
    );
  };

  // ---------------- UI RETURN -------------------
  return (
    <View style={styles.container}>
      <Text style={styles.header}>🏫 Quản lý lớp học</Text>

      <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
        <Text style={styles.addBtnText}>➕ Thêm lớp mới</Text>
      </TouchableOpacity>

      <FlatList
        data={classes}
        keyExtractor={(item) => item._id}
        renderItem={renderClassItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {currentClass && (
        <ClassStudentManagerModal
          visible={showStudentModal}
          classData={currentClass} // Luôn là data mới nhất từ biến derived
          onClose={() => setSelectedClassId(null)} // Đóng bằng cách set null
          onUpdate={() => {
            loadData(); // Khi Modal báo update -> loadData chạy -> classes mới -> currentClass tự mới theo
          }}
        />
      )}

      {/* Modal thêm lớp */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>➕ Tạo lớp mới</Text>

            <TextInput
              placeholder="Tên lớp (VD: Mầm 1)"
              style={styles.input}
              value={newClass.name}
              onChangeText={(t) => setNewClass({ ...newClass, name: t })}
            />

            <Text style={styles.label}>Class Level</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={newClass.level}
                onValueChange={(value) => setNewClass({ ...newClass, level: value })}
              >
                <Picker.Item label="-- Select level --" value="" />
                <Picker.Item label="Infant (0-1year)" value="infant" />
                <Picker.Item label="Toddler (1-2years)" value="toddler" />
                <Picker.Item label="Pre-K 2 (2years)" value="preK2" />
                <Picker.Item label="Pre-K 3 (3years)" value="preK3" />
                <Picker.Item label="Pre-K 4 (4years)" value="preK4" />
                <Picker.Item label="Pre-K 5 (5years)" value="preK5" />
              </Picker>
            </View>

            {/* RULE PREVIEW */}
            {newClass.level !== "" && (
              <View style={styles.rulePreview}>
                <Text style={styles.rulePreviewTitle}>📌 Quy định của lớp:</Text>
                <Text>
                  • Giáo viên tối thiểu:{" "}
                  <Text style={{ fontWeight: "700" }}>
                    {CLASS_RULES[newClass.level].minTeachers}
                  </Text>
                </Text>
                <Text>
                  • Sĩ số:{" "}
                  <Text style={{ fontWeight: "700" }}>
                    {CLASS_RULES[newClass.level].minStudents} – {CLASS_RULES[newClass.level].maxStudents} trẻ
                  </Text>
                </Text>
              </View>
            )}

            <TextInput
              placeholder="Mô tả"
              style={styles.input}
              value={newClass.description}
              onChangeText={(t) => setNewClass({ ...newClass, description: t })}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleCreateClass}>
              <Text style={styles.saveBtnText}>💾 Lưu</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={{ color: "red", marginTop: 8 }}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ---------------- STYLES -------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E6FDF3", padding: 16 },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#064E3B",
    marginBottom: 12,
  },
  addBtn: {
    backgroundColor: "#10B981",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  addBtnText: { color: "#fff", fontWeight: "bold" },

  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },

  classTitle: { fontSize: 18, fontWeight: "bold", color: "#064E3B" },
  level: { color: "#047857", fontWeight: "500", marginTop: 2 },
  desc: { color: "#666", marginVertical: 4 },

  ruleLabel: { marginTop: 4, fontWeight: "600", color: "#064E3B" },
  ruleValue: { marginLeft: 4, marginBottom: 4 },

  label: { marginTop: 6, fontWeight: "bold", color: "#064E3B" },
  teacherItem: { color: "#065F46", marginLeft: 8 },

  assignBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    backgroundColor: "#E6FDF3",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },

  assignBtn: {
    backgroundColor: "#10B981",
    padding: 10,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  assignText: { color: "#fff", fontWeight: "bold" },

  /* modal */
  modalBg: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalBox: {
    backgroundColor: "#fff",
    width: "80%",
    padding: 16,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#064E3B",
    marginBottom: 12,
  },

  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },

  pickerWrapper: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 12,
  },

  rulePreview: {
    backgroundColor: "#ECFDF5",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  rulePreviewTitle: {
    fontWeight: "700",
    marginBottom: 4,
    color: "#065F46",
  },

  saveBtn: {
    backgroundColor: "#10B981",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontWeight: "bold" },
  teacherRow: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#F0FFF4",
  paddingVertical: 8,
  paddingHorizontal: 10,
  borderRadius: 6,
  marginTop: 6,
  // bỏ justifyContent: 'space-between' để dùng flex
},
teacherInfo: {
  flex: 1, // Quan trọng: Chiếm hết khoảng trống còn lại
  marginRight: 10, // Cách nút xóa ra 1 chút
  color: "#065F46",
  fontSize: 14,
},
deleteIconBtn: {
  padding: 4,
},
deleteIconText: {
  fontSize: 16,
},

removeTeacherBtn: {
  fontSize: 20,
  color: "#dc2626",
  paddingHorizontal: 8,
},

deleteClassBtn: {
  backgroundColor: "#fee2e2",
  padding: 8,
  borderRadius: 8,
  marginTop: 10,
  alignItems: "center",
},

deleteClassText: {
  color: "#dc2626",
  fontWeight: "700",
},
studentSection: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  rowBetween: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 5
  },
  manageBtn: {
    backgroundColor: '#3B82F6',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6
  },
  manageBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  
  enrollBox: {
    backgroundColor: '#F0F9FF',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BAE6FD'
  },
  pickerRow: { flexDirection: 'row', gap: 10 },
  addIconBtn: {
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    paddingHorizontal: 15,
    borderRadius: 5
  },
  studentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee'
  },
  studentName: { fontSize: 16, color: '#333' },
  closeBtn: { alignSelf: 'center', padding: 10 }
});

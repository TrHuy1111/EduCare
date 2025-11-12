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
} from "../src/services/classService";
import { fetchTeachers } from "../src/services/userService";

export default function AdminClassManagementScreen() {
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<{ [key: string]: string }>({});
  const [showModal, setShowModal] = useState(false);
  const [newClass, setNewClass] = useState({
    name: "",
    level: "",
    description: "",
  });

  // 🧠 Load dữ liệu lớp & giáo viên khi vào màn hình
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

  // ➕ Tạo lớp mới
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

  // 👩‍🏫 Gán giáo viên vào lớp
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
    Alert.alert("❌ Lỗi", err.message);
  }
};

  // 🧾 Render từng lớp trong danh sách
  const renderClassItem = ({ item }: any) => (
    <View style={styles.card}>
      <Text style={styles.classTitle}>{item.name}</Text>
      <Text style={styles.level}>Cấp độ: {item.level}</Text>
      <Text style={styles.desc}>{item.description}</Text>

      <Text style={styles.label}>Giáo viên hiện tại:</Text>
      {item.teachers?.length > 0 ? (
        item.teachers.map((t: any) => (
          <Text key={t._id} style={styles.teacherItem}>
            👩‍🏫 {t.name} ({t.email})
          </Text>
        ))
      ) : (
        <Text style={{ color: "#888" }}>Chưa có giáo viên</Text>
      )}

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
            <Picker.Item
              key={t._id}
              label={`${t.name} (${t.email})`}
              value={t._id}
            />
          ))}
        </Picker>

        <TouchableOpacity
          style={styles.assignBtn}
          onPress={() => handleAssignTeacher(item._id)}
        >
          <Text style={styles.assignText}>➕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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

      {/* 🔹 Modal thêm lớp */}
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
            <TextInput
              placeholder="Mô tả"
              style={styles.input}
              value={newClass.description}
              onChangeText={(t) =>
                setNewClass({ ...newClass, description: t })
              }
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

// 🎨 Styles
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
    borderColor: "#ccc",
    borderWidth: 1,
  },
  classTitle: { fontSize: 18, fontWeight: "bold", color: "#064E3B" },
  level: { color: "#047857", fontWeight: "500", marginTop: 2 },
  desc: { color: "#666", marginVertical: 4 },
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
  saveBtn: {
    backgroundColor: "#10B981",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontWeight: "bold" },
  pickerWrapper: {
  backgroundColor: "#fff",
  borderRadius: 10,
  borderWidth: 1,
  borderColor: "#ccc",
  marginBottom: 12,
},
});

// AdminStudentFormScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import RNFS from "react-native-fs";
import { launchImageLibrary } from "react-native-image-picker";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";

import {
  createStudent,
  updateStudent,
  getStudentById,
} from "../src/services/studentService";
import { getAllClasses, enrollStudentToClass } from "../src/services/classService";

export default function AdminStudentFormScreen() {
  const [form, setForm] = useState({
    name: "",
    classId: "",
    address: "",
    dob: new Date(),
    gender: "male",
    height: "",
    weight: "",
    avatar: "",
    fatherName: "",
    fatherPhone: "",
    motherName: "",
    motherPhone: "",
    teacher: "",
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const route = useRoute();
  const { editId }: any = route.params || {};
  const navigation = useNavigation();

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (classes.length > 0 && editId) {
      loadStudent();
    }
  }, [classes, editId]);

  const loadClasses = async () => {
    try {
      const res = await getAllClasses();
      setClasses(res.data);
    } catch (err: any) {
      console.log("❌ Lỗi tải lớp:", err.message);
    }
  };

  const handleClassChange = (classId: string) => {
    if (classId === "none") {
      setForm({ ...form, classId: "", teacher: "" });
      setTeachers([]);
      return;
    }

    const selected = classes.find((c) => c._id === classId);
    setForm({ ...form, classId, teacher: "" });
    setTeachers(selected?.teachers || []);
  };

  const loadStudent = async () => {
    try {
      const res = await getStudentById(editId);
      const s = res.data;

      if (s.classId) {
        const selected = classes.find((c) => c._id === s.classId);
        setTeachers(selected?.teachers || []);
      }

      setForm({
        ...s,
        classId: s.classId || "",
        teacher: s.teacher || "",
        dob: s.dob ? new Date(s.dob) : new Date(),
        height: s.height?.toString() ?? "",
        weight: s.weight?.toString() ?? "",
      });
    } catch (err: any) {
      console.log("❌ Lỗi load student:", err.message);
    }
  };

  const handleSubmit = async () => {
  try {
    const payload = {
      ...form,
      height: Number(form.height),
      weight: Number(form.weight),
    };

    if (editId) {
      // 🔧 Update mode
      await updateStudent(editId, payload);

      if (payload.classId) {
        // nếu đổi lớp → add lại vào class.students
        await enrollStudentToClass(payload.classId, editId);
      }

      Alert.alert("✅ Thành công", "Cập nhật học sinh thành công!");
    } else {
      // ➕ Create mode
      const res = await createStudent(payload);
      const studentId = res.data.student._id;

      if (payload.classId) {
        await enrollStudentToClass(payload.classId, studentId);
      }

      Alert.alert("✅ Thành công", "Thêm học sinh mới thành công!");
    }

    navigation.goBack();
  } catch (err: any) {
    Alert.alert("❌ Lỗi", err.message);
  }
};

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* Title with emoji separated into its own <Text> to avoid Android emoji rendering issues */}
      <Text style={styles.title}>
        <Text>{editId ? "✏️ " : "➕ "}</Text>
        <Text>{editId ? "Sửa thông tin học sinh" : "Thêm học sinh"}</Text>
      </Text>

      {/* Avatar */}
      <TouchableOpacity
        onPress={async () => {
          const result = await launchImageLibrary({ mediaType: "photo" });
          if (!result.assets?.[0]?.uri) return;

          const fileUri = result.assets[0].uri;
          try {
            const base64 = await RNFS.readFile(fileUri, "base64");
            setForm({ ...form, avatar: `data:image/jpeg;base64,${base64}` });
          } catch (err: any) {
            console.log("❌ Read file error:", err.message);
          }
        }}
        style={styles.avatarContainer}
      >
        {form.avatar ? (
          <Image source={{ uri: form.avatar }} style={styles.avatar} />
        ) : (
          // emoji separated into its own Text node
          <Text style={{ color: "#666" }}>
            <Text>Chọn ảnh đại diện </Text>
            <Text>📷</Text>
          </Text>
        )}
      </TouchableOpacity>

      {/* Name */}
      <Text style={styles.label}>Họ và tên</Text>
      <TextInput
        style={styles.input}
        value={form.name}
        onChangeText={(t) => setForm({ ...form, name: t })}
      />

      {/* Class picker */}
      <Text style={styles.label}>Lớp</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={form.classId || "none"}
          onValueChange={(value) => handleClassChange(value as string)}
          style={styles.picker}
        >
          <Picker.Item label="-- Chọn lớp --" value="none" />
          {classes.map((c) => (
            <Picker.Item key={c._id} label={`${c.name} (${c.level})`} value={c._id} />
          ))}
        </Picker>
      </View>

      {/* Teacher picker */}
      <Text style={styles.label}>Giáo viên chủ nhiệm</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={form.teacher || "none"}
          enabled={teachers.length > 0}
          onValueChange={(value) =>
            setForm({ ...form, teacher: (value === "none" ? "" : (value as string)) })
          }
          style={styles.picker}
        >
          <Picker.Item
            label={teachers.length === 0 ? "Không có giáo viên trong lớp" : "-- Chọn giáo viên --"}
            value="none"
          />
          {teachers.map((t) => (
            <Picker.Item key={t._id} label={`${t.name} (${t.email})`} value={t._id} />
          ))}
        </Picker>
      </View>

      {/* Address */}
      <Text style={styles.label}>Địa chỉ</Text>
      <TextInput
        style={styles.input}
        value={form.address}
        onChangeText={(t) => setForm({ ...form, address: t })}
      />

      {/* Date of birth */}
      <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.dateText}>
          <Text>Ngày sinh: </Text>
          <Text>{form.dob.toLocaleDateString("vi-VN")}</Text>
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={form.dob}
          mode="date"
          onChange={(e, date) => {
            setShowDatePicker(false);
            if (date) setForm({ ...form, dob: date });
          }}
        />
      )}

      {/* Gender */}
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.genderBtn, form.gender === "male" && styles.active]}
          onPress={() => setForm({ ...form, gender: "male" })}
        >
          <Text>
            <Text>👦 </Text>
            <Text>Nam</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.genderBtn, form.gender === "female" && styles.active]}
          onPress={() => setForm({ ...form, gender: "female" })}
        >
          <Text>
            <Text>👧 </Text>
            <Text>Nữ</Text>
          </Text>
        </TouchableOpacity>
      </View>

      {/* Height */}
      <Text style={styles.label}>Chiều cao (cm)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={form.height}
        onChangeText={(t) => setForm({ ...form, height: t })}
      />

      {/* Weight */}
      <Text style={styles.label}>Cân nặng (kg)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={form.weight}
        onChangeText={(t) => setForm({ ...form, weight: t })}
      />

      {/* Parents */}
      <Text style={styles.label}>Tên cha</Text>
      <TextInput
        style={styles.input}
        value={form.fatherName}
        onChangeText={(t) => setForm({ ...form, fatherName: t })}
      />

      <Text style={styles.label}>Số điện thoại cha</Text>
      <TextInput
        style={styles.input}
        keyboardType="phone-pad"
        value={form.fatherPhone}
        onChangeText={(t) => setForm({ ...form, fatherPhone: t })}
      />

      <Text style={styles.label}>Tên mẹ</Text>
      <TextInput
        style={styles.input}
        value={form.motherName}
        onChangeText={(t) => setForm({ ...form, motherName: t })}
      />

      <Text style={styles.label}>Số điện thoại mẹ</Text>
      <TextInput
        style={styles.input}
        keyboardType="phone-pad"
        value={form.motherPhone}
        onChangeText={(t) => setForm({ ...form, motherPhone: t })}
      />

      {/* Submit */}
      <TouchableOpacity style={styles.btn} onPress={handleSubmit}>
        <Text style={styles.btnText}>
          <Text>💾 </Text>
          <Text>Lưu</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E6FDF3", padding: 16 },
  title: { fontSize: 20, fontWeight: "bold", color: "#064E3B", marginBottom: 12 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  dateBtn: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  dateText: { color: "#064E3B" },
  pickerWrapper: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 12,
  },
  picker: { height: 50 },
  avatarContainer: {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 12,
  },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  label: { fontWeight: "600", fontSize: 14, color: "#064E3B", marginBottom: 4 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  genderBtn: {
    backgroundColor: "#fff",
    flex: 0.48,
    padding: 12,
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  active: { backgroundColor: "#A7F3D0", borderColor: "#10B981" },
  btn: {
    backgroundColor: "#10B981",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 30,
  },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

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

import { fetchParents } from "../src/services/userService";
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
    joinedDate: new Date(),
    endDate: null as Date | null,
    address: "",
    dob: new Date(),
    gender: "male",
    height: "",
    weight: "",
    avatar: "",
    fatherId: "",
    fatherName: "",
    fatherPhone: "",
    motherId: "",
    motherName: "",
    motherPhone: "",
    teacher: "",
  });

  const [showDobPicker, setShowDobPicker] = useState(false);
  const [showJoinedPicker, setShowJoinedPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [parents, setParents] = useState<any[]>([]);
  
  const route = useRoute();
  const { editId }: any = route.params || {};
  const navigation = useNavigation();

  useEffect(() => {
    loadParents();
    loadClasses();
  }, []);

  useEffect(() => {
    if (classes.length > 0 && editId) {
      loadStudent();
    }
  }, [classes, editId]);

  const loadParents = async () => {
    try {
      const res = await fetchParents();
      setParents(res);
    } catch (err) {
      console.log("❌ Lỗi load parents:", err);
    }
  };

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
        const selected = classes.find((c) => c._id === s.classId || c._id === s.classId._id);
        if (selected) setTeachers(selected.teachers);
      }

      setForm({
        ...s,
        classId: typeof s.classId === "string" ? s.classId : s.classId?._id ?? "",
        teacher: typeof s.teacher === "string" ? s.teacher : s.teacher?._id ?? "",
        dob: s.dob ? new Date(s.dob) : new Date(),
        joinedDate: s.joinedDate ? new Date(s.joinedDate) : new Date(),
        endDate: s.endDate ? new Date(s.endDate) : null,
        height: s.height?.toString() ?? "",
        weight: s.weight?.toString() ?? "",
        fatherId: s.parents?.[0]?._id ?? "",
        motherId: s.parents?.[1]?._id ?? "",
        fatherName: s.fatherName ?? "",
        fatherPhone: s.fatherPhone ?? "",
        motherName: s.motherName ?? "",
        motherPhone: s.motherPhone ?? "",
      });
    } catch (err: any) {
      console.log("❌ Lỗi load student:", err.message);
    }
  };

  const handleSubmit = async () => {
    console.log("FORM DEBUG:", form);

    // VALIDATION
    const heightNum = parseFloat(form.height);
    if (!form.height || isNaN(heightNum) || heightNum <= 0) {
      Alert.alert("Lỗi", "Chiều cao phải là số lớn hơn 0");
      return;
    }

    const weightNum = parseFloat(form.weight);
    if (!form.weight || isNaN(weightNum) || weightNum <= 0) {
      Alert.alert("Lỗi", "Cân nặng phải là số lớn hơn 0");
      return;
    }

    if (form.classId === "" || form.classId === "none") {
      Alert.alert("Lỗi", "Bạn phải chọn lớp cho học sinh");
      return;
    }

    // Joined date validation
    if (!form.joinedDate) {
      Alert.alert("Lỗi", "Phải nhập ngày nhập học");
      return;
    }

    //if (form.joinedDate > new Date()) {
      //Alert.alert("Lỗi", "Ngày nhập học không hợp lệ");
      //return;
   // }

    // End date validation
    if (form.endDate && form.endDate < form.joinedDate) {
      Alert.alert(
        "Lỗi",
        "Ngày kết thúc học không được trước ngày nhập học"
      );
      return;
    }

    // Age validation
    const dob = new Date(form.dob);
    const today = new Date();
    const ageInMonths =
      (today.getFullYear() - dob.getFullYear()) * 12 +
      (today.getMonth() - dob.getMonth());
    const age = ageInMonths / 12;

    const classRules: any = {
      infant: { min: 0, max: 1 },
      toddler: { min: 1, max: 2 },
      preK2: { min: 2, max: 3 },
      preK3: { min: 3, max: 4 },
      preK4: { min: 4, max: 5 },
      preK5: { min: 5, max: 6 },
    };

    const selectedClass = classes.find((c) => c._id === form.classId);
    if (selectedClass) {
      const rule = classRules[selectedClass.level];

      if (age < rule.min || age >= rule.max) {
        Alert.alert(
          "Sai độ tuổi",
          `Lớp ${selectedClass.name} (${selectedClass.level}) yêu cầu tuổi từ ${rule.min} đến dưới ${rule.max}.`
        );
        return;
      }
    }

    try {
      const payload = {
        ...form,
        height: heightNum,
        weight: weightNum,
        parents: [form.fatherId, form.motherId].filter(Boolean),
      };

      if (editId) {
        await updateStudent(editId, payload);
        if (payload.classId) await enrollStudentToClass(payload.classId, editId);
        Alert.alert("✅ Thành công", "Cập nhật học sinh thành công!");
      } else {
        const res = await createStudent(payload);
        const studentId = res.data.student._id;

        if (payload.classId) await enrollStudentToClass(payload.classId, studentId);
        Alert.alert("✅ Thành công", "Thêm học sinh mới thành công!");
      }

      navigation.goBack();
    } catch (err: any) {
      Alert.alert("❌ Lỗi", err.message);
    }
  };

  const computeAgeText = (dob: Date) => {
    const now = new Date();
    let years = now.getFullYear() - dob.getFullYear();
    let months = now.getMonth() - dob.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    }

    if (years <= 0) return `${months} months old`;

    return `${years} years old`;
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>
        {editId ? "✏️ Sửa thông tin học sinh" : "➕ Thêm học sinh"}
      </Text>

      {/* Avatar */}
      <TouchableOpacity
        onPress={async () => {
          const result = await launchImageLibrary({ mediaType: "photo" });
          if (!result.assets?.[0]?.uri) return;

          const base64 = await RNFS.readFile(result.assets[0].uri, "base64");
          setForm({ ...form, avatar: `data:image/jpeg;base64,${base64}` });
        }}
        style={styles.avatarContainer}
      >
        {form.avatar ? (
          <Image source={{ uri: form.avatar }} style={styles.avatar} />
        ) : (
          <Text style={{ color: "#666" }}>Choose Image 📷</Text>
        )}
      </TouchableOpacity>

      {/* Name */}
      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={form.name}
        onChangeText={(t) => setForm({ ...form, name: t })}
      />

      {/* Class Picker */}
      <Text style={styles.label}>Class</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={form.classId || "none"}
          onValueChange={(value) => handleClassChange(value as string)}
        >
          <Picker.Item label="-- Chọn lớp --" value="none" />
          {classes.map((c) => (
            <Picker.Item key={c._id} label={`${c.name} (${c.level})`} value={c._id} />
          ))}
        </Picker>
      </View>
      
      {/* Joined Date */}
      <Text style={styles.label}>Ngày nhập học</Text>

        <TouchableOpacity
          style={styles.dateBtn}
          onPress={() => setShowJoinedPicker(true)}
        >
          <Text style={styles.dateText}>
            Joined: {form.joinedDate.toLocaleDateString("vi-VN")}
          </Text>
        </TouchableOpacity>

        {showJoinedPicker && (
          <DateTimePicker
            value={form.joinedDate}
            mode="date"
            onChange={(e, date) => {
              setShowJoinedPicker(false);
              if (date) setForm({ ...form, joinedDate: date });
            }}
          />
        )}

      {/* End Date */}
      <Text style={styles.label}>Ngày kết thúc học (nếu có)</Text>

      <TouchableOpacity
        style={styles.dateBtn}
        onPress={() => setShowEndPicker(true)}
      >
        <Text style={styles.dateText}>
          {form.endDate
            ? `Kết thúc: ${form.endDate.toLocaleDateString("vi-VN")}`
            : "Đang học (chưa có ngày kết thúc)"}
        </Text>
      </TouchableOpacity>

      {showEndPicker && (
        <DateTimePicker
          value={form.endDate || new Date()}
          mode="date"
          onChange={(e, date) => {
            setShowEndPicker(false);
            if (date) setForm({ ...form, endDate: date });
          }}
        />
      )}

      {/* Clear end date */}
      {form.endDate && (
        <TouchableOpacity
          onPress={() => setForm({ ...form, endDate: null })}
          style={{ marginBottom: 12 }}
        >
          <Text style={{ color: "#DC2626", fontWeight: "600" }}>
            ❌ Xóa ngày kết thúc (tiếp tục học)
          </Text>
        </TouchableOpacity>
      )}

      {/* Teacher Picker */}
      <Text style={styles.label}>Head Teacher</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={form.teacher || "none"}
          enabled={teachers.length > 0}
          onValueChange={(value) =>
            setForm({ ...form, teacher: value === "none" ? "" : value })
          }
        >
          <Picker.Item
            label={teachers.length === 0 ? "Không có giáo viên" : "-- Chọn giáo viên --"}
            value="none"
          />
          {teachers.map((t) => (
            <Picker.Item key={t._id} label={`${t.name} (${t.email})`} value={t._id} />
          ))}
        </Picker>
      </View>

      {/* Address */}
      <Text style={styles.label}>Address</Text>
      <TextInput
        style={styles.input}
        value={form.address}
        onChangeText={(t) => setForm({ ...form, address: t })}
      />

      {/* DOB */}
      <TouchableOpacity
        style={styles.dateBtn}
        onPress={() => setShowDobPicker(true)}
      >
        <Text style={styles.dateText}>
          Birth: {form.dob.toLocaleDateString("vi-VN")}
        </Text>
      </TouchableOpacity>

      {showDobPicker && (
        <DateTimePicker
          value={form.dob}
          mode="date"
          onChange={(e, date) => {
            setShowDobPicker(false);
            if (date) setForm({ ...form, dob: date });
          }}
        />
      )}


      <Text style={styles.ageText}>Age: {computeAgeText(form.dob)}</Text>

      {/* Gender */}
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.genderBtn, form.gender === "male" && styles.active]}
          onPress={() => setForm({ ...form, gender: "male" })}
        >
          <Text>👦 Male</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.genderBtn, form.gender === "female" && styles.active]}
          onPress={() => setForm({ ...form, gender: "female" })}
        >
          <Text>👧 Female</Text>
        </TouchableOpacity>
      </View>

      {/* Height */}
      <Text style={styles.label}>Height (cm)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={form.height}
        onChangeText={(t) => setForm({ ...form, height: t })}
      />

      {/* Weight */}
      <Text style={styles.label}>Weight (kg)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={form.weight}
        onChangeText={(t) => setForm({ ...form, weight: t })}
      />

      {/* Father Picker */}
      <Text style={styles.label}>Father</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={form.fatherId || "none"}
          onValueChange={(value) => {
            if (value === "none") {
              setForm({
                ...form,
                fatherId: "",
                fatherName: "",
                fatherPhone: "",
              });
              return;
            }

            const p = parents.find((u) => u._id === value);
            setForm({
              ...form,
              fatherId: p._id,
              fatherName: p.name,
              fatherPhone: p.phone,
            });
          }}
        >
          <Picker.Item label="-- Chọn cha --" value="none" />
          {parents.map((p) => (
            <Picker.Item key={p._id} label={`${p.name} | ${p.phone}`} value={p._id} />
          ))}
        </Picker>
      </View>

      {/* Mother Picker */}
      <Text style={styles.label}>Mother</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={form.motherId || "none"}
          onValueChange={(value) => {
            if (value === "none") {
              setForm({
                ...form,
                motherId: "",
                motherName: "",
                motherPhone: "",
              });
              return;
            }

            const p = parents.find((u) => u._id === value);
            setForm({
              ...form,
              motherId: p._id,
              motherName: p.name,
              motherPhone: p.phone,
            });
          }}
        >
          <Picker.Item label="-- Chọn mẹ --" value="none" />
          {parents.map((p) => (
            <Picker.Item key={p._id} label={`${p.name} | ${p.phone}`} value={p._id} />
          ))}
        </Picker>
      </View>

      {/* Submit */}
      <TouchableOpacity style={styles.btn} onPress={handleSubmit}>
        <Text style={styles.btnText}>💾 Save</Text>
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
  label: { marginTop: 10, fontWeight: "600", fontSize: 14 },
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
    marginBottom: 50,
  },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  ageText: {
    marginBottom: 12,
    fontSize: 15,
    color: "#047857",
    fontWeight: "600",
  },
  dateText: {
  color: "#064E3B",
  fontSize: 15,
  fontWeight: "500",
},
});

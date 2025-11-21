// EduCareApp/screens/AttendanceHomeScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { TeacherStackParamList } from "../navigation/TeacherNavigator";

import { getTeacherClasses } from "../src/services/attendanceService";

export default function AttendanceHomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<TeacherStackParamList>>();

  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSession, setSelectedSession] = useState<"morning" | "afternoon">("morning");

  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const res = await getTeacherClasses();
      setClasses(res.data);
    } catch (err: any) {
      console.log("❌ Error load classes:", err.message);
    }
  };

  const formattedDate = date.toISOString().split("T")[0];

  const handleStart = () => {
    if (!selectedClass) {
      Alert.alert("Thông báo", "Vui lòng chọn lớp");
      return;
    }

    navigation.navigate("AttendanceStudentScreen", {
  classId: selectedClass,
  session: selectedSession,
  date: formattedDate,
});
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📆 Attendance</Text>

      {/* CLASS PICKER */}
      <Text style={styles.label}>Chọn lớp</Text>
      <View style={styles.pickerBox}>
        <Picker
          selectedValue={selectedClass}
          onValueChange={(value: string) => setSelectedClass(value)}
        >
          <Picker.Item label="-- Chọn lớp --" value="" />
          {classes.map((c) => (
            <Picker.Item
              key={c._id}
              label={`${c.name} (${c.level})`}
              value={c._id}
            />
          ))}
        </Picker>
      </View>

      {/* DATE PICKER */}
      <Text style={styles.label}>Chọn ngày</Text>

      <TouchableOpacity
        style={styles.dateBtn}
        onPress={() => setShowPicker(true)}
      >
        <Text style={{ fontSize: 16 }}>{formattedDate}</Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          onChange={(e, newDate) => {
            setShowPicker(false);
            if (newDate) setDate(newDate);
          }}
        />
      )}

      {/* SESSION PICKER */}
      <Text style={styles.label}>Chọn buổi</Text>
      <View style={styles.pickerBox}>
        <Picker
          selectedValue={selectedSession}
          onValueChange={(value: string) => setSelectedSession(value as "morning" | "afternoon")}
        >
          <Picker.Item label="Buổi sáng" value="morning" />
          <Picker.Item label="Buổi chiều" value="afternoon" />
        </Picker>
      </View>

      {/* START BUTTON */}
      <TouchableOpacity style={styles.btnStart} onPress={handleStart}>
        <Text style={styles.btnText}>Bắt đầu điểm danh</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#E6FDF3",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#064E3B",
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    marginBottom: 6,
    color: "#064E3B",
    fontWeight: "600",
  },
  pickerBox: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 16,
  },
  dateBtn: {
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 16,
  },
  btnStart: {
    backgroundColor: "#10B981",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  btnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});

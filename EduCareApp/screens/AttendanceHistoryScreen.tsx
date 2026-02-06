import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { getTeacherClasses, getAttendanceHistory } from "../src/services/attendanceService";
import { useNavigation } from "@react-navigation/native";
  
export default function AttendanceHistoryScreen() {
  const navigation = useNavigation<any>();

  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const res = await getTeacherClasses();
      setClasses(res.data);
    } catch (err) {
      console.log("❌ Load teacher classes error:", err);
    }
  };

  const loadHistory = async (classId: string) => {
    if (!classId) return;

    setLoading(true);
    try {
      const res = await getAttendanceHistory(classId);
      setHistory(res.data);
    } catch (err) {
      console.log("❌ Load attendance history error:", err);
    }
    setLoading(false);
  };

  const handleSelectClass = (id: string) => {
    setSelectedClass(id);
    loadHistory(id);
  };

  const countBySession = (records: any[], session: string, status: string) =>
    records.filter((r) => r.session === session && r.status === status).length;

  return (
    <ScrollView style={styles.container}>
      {/* CLASS PICKER */}
      <Text style={styles.label}>Chọn lớp</Text>
      <View style={styles.pickerBox}>
        <Picker selectedValue={selectedClass} onValueChange={handleSelectClass}>
          <Picker.Item label="-- Chọn lớp --" value="" />
          {classes.map((c) => (
            <Picker.Item key={c._id} label={`${c.name} (${c.level})`} value={c._id} />
          ))}
        </Picker>
      </View>
    
      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <>
          {history.length === 0 && selectedClass !== "" ? (
            <Text style={styles.emptyText}>Không có dữ liệu điểm danh</Text>
          ) : (
            history.map((item) => {
              const morningPresent = item.morning.present;
              const morningAbsent = item.morning.absent;

              const afternoonPresent = item.afternoon.present;
              const afternoonAbsent = item.afternoon.absent;

              return (
                <TouchableOpacity
                    key={item.date}
                    style={styles.card}
                    onPress={() =>
                    navigation.navigate("AttendanceDetailScreen", {
                        classId: selectedClass,
                        date: item.date,
                    })
                    }
                >
                    <Text style={styles.date}>{item.date}</Text>

                    <View style={styles.row}>
                    <Text style={styles.session}>Buổi sáng:</Text>
                    <Text style={styles.present}>✓ {morningPresent}</Text>
                    <Text style={styles.absent}>✗ {morningAbsent}</Text>
                    </View>

                    <View style={styles.row}>
                    <Text style={styles.session}>Buổi chiều:</Text>
                    <Text style={styles.present}>✓ {afternoonPresent}</Text>
                    <Text style={styles.absent}>✗ {afternoonAbsent}</Text>
                    </View>
                </TouchableOpacity>
              );
            })
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#E6FDF3" },
  title: { fontSize: 22, fontWeight: "800", color: "#064E3B", marginBottom: 18 },
  label: { fontSize: 16, marginBottom: 6, color: "#064E3B", fontWeight: "600" },
  pickerBox: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 18,
  },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#d7e5dd",
  },
  date: { fontSize: 17, fontWeight: "700", color: "#065f46", marginBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  session: { width: 90, fontWeight: "600" },
  present: { color: "#22C55E", marginLeft: 10, fontWeight: "700" },
  absent: { color: "#EF4444", marginLeft: 20, fontWeight: "700" },
  emptyText: { textAlign: "center", marginTop: 20, color: "#666" },
});

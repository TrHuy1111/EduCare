import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { TeacherStackParamList } from "../navigation/TeacherNavigator";
import { getAttendance } from "../src/services/attendanceService";

type Props = NativeStackScreenProps<
  TeacherStackParamList,
  "AttendanceDetailScreen"
>;

export default function AttendanceDetailScreen({ route }: Props) {
  const { classId, date } = route.params;

  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    loadDetail();
  }, []);

  const loadDetail = async () => {
    try {
      const res = await getAttendance(classId, date);
      const data = res.data;

      if (data && Array.isArray(data.records)) {
        setRecords(data.records);
      }

    } catch (err) {
      console.log("❌ Load detail error:", err);
    }
    setLoading(false);
  };

  const getStatus = (studentId: string, session: string) => {
    const rec = records.find(
      (r) => r.student?._id === studentId && r.session === session
    );
    return rec || null;
  };

  const uniqueStudents = Array.from(
    new Map(records.map((r) => [r.student._id, r.student])).values()
  );

  if (loading)
    return <ActivityIndicator style={{ marginTop: 40 }} size="large" />;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.dateText}>{date}</Text>

      {uniqueStudents.length === 0 ? (
        <Text style={styles.empty}>Không có dữ liệu</Text>
      ) : (
        uniqueStudents.map((stu) => {
          const morning = getStatus(stu._id, "morning");
          const afternoon = getStatus(stu._id, "afternoon");

          return (
            <View key={stu._id} style={styles.card}>
              <Text style={styles.name}>{stu.name}</Text>

              {/* Morning */}
              <View style={styles.row}>
                <Text style={styles.session}>Sáng:</Text>
                <Text
                  style={[
                    styles.badge,
                    morning?.status === "present"
                      ? styles.present
                      : styles.absent,
                  ]}
                >
                  {morning?.status === "present" ? "Có mặt" : "Vắng"}
                </Text>
              </View>
              {morning?.note ? (
                <Text style={styles.note}>📝 {morning.note}</Text>
              ) : null}

              {/* Afternoon */}
              <View style={styles.row}>
                <Text style={styles.session}>Chiều:</Text>
                <Text
                  style={[
                    styles.badge,
                    afternoon?.status === "present"
                      ? styles.present
                      : styles.absent,
                  ]}
                >
                  {afternoon?.status === "present" ? "Có mặt" : "Vắng"}
                </Text>
              </View>
              {afternoon?.note ? (
                <Text style={styles.note}>📝 {afternoon.note}</Text>
              ) : null}
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F0FFF7" },
  title: { fontSize: 22, fontWeight: "800", color: "#064E3B" },
  dateText: { color: "#065F46", marginBottom: 16 , fontWeight: "700", fontSize: 28, textAlign: "center"},
  empty: { textAlign: "center", marginTop: 20, color: "#656565" },

  card: {
    backgroundColor: "#fff",
    padding: 14,
    marginBottom: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1E7DD",
  },

  name: { fontSize: 18, fontWeight: "700", color: "#064E3B" },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  session: { width: 60, fontWeight: "600" },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    color: "#fff",
    fontWeight: "700",
  },
  present: { backgroundColor: "#22C55E" },
  absent: { backgroundColor: "#EF4444" },

  note: {
    marginTop: 4,
    fontStyle: "italic",
    color: "#6B7280",
  },
});

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { TeacherStackParamList } from "../navigation/TeacherNavigator";
import {
  getStudentsByClass,
  getAttendance,
  saveAttendance,
} from "../src/services/attendanceService";

type Props = NativeStackScreenProps<
  TeacherStackParamList,
  "AttendanceStudentScreen"
>;

type Choice = "present" | "absent" | undefined;

export default function AttendanceStudentScreen({ route, navigation }: Props) {
  const { classId, date, session } = route.params;

  const [students, setStudents] = useState<any[]>([]);
  const [choices, setChoices] = useState<Record<string, Choice>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const sRes = await getStudentsByClass(classId);
        const list = sRes.data || [];
        setStudents(list);

        const map: Record<string, Choice> = {};
        list.forEach((s: any) => (map[s._id] = undefined));

        const attRes = await getAttendance(classId, date);
        const attData = attRes.data;

        if (attData && Array.isArray(attData.records)) {
          attData.records.forEach((r: any) => {
            const sid = r.student?._id || r.student;
            if (sid && r.session === session) {
              if (r.status === "present" || r.status === "absent") {
                map[sid] = r.status;
              }
            }
          });
        }
        setChoices(map);
        setInitialLoaded(true);
      } catch (err) {
        Alert.alert("Lỗi", "Không thể tải dữ liệu điểm danh.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const togglePresent = (id: string) =>
    setChoices((p) => ({ ...p, [id]: p[id] === "present" ? undefined : "present" }));

  const toggleAbsent = (id: string) =>
    setChoices((p) => ({ ...p, [id]: p[id] === "absent" ? undefined : "absent" }));

  const presentCount = Object.values(choices).filter((c) => c === "present").length;
  const absentCount = Object.values(choices).filter((c) => c === "absent").length;

  const handleSave = async () => {
    setSaving(true);
    try {
      const existing = await getAttendance(classId, date);
      const existingDoc = existing.data;

      const mergedRecords: any[] = [];

      if (existingDoc && Array.isArray(existingDoc.records)) {
        existingDoc.records.forEach((r: any) => {
          if (r.session !== session) {
            mergedRecords.push({
              student: r.student?._id || r.student,
              session: r.session,
              status: r.status,
              note: r.note || "",
            });
          }
        });
      }

      Object.keys(choices).forEach((sid) => {
        const st = choices[sid];
        if (!st) return;
        mergedRecords.push({
          student: sid,
          session,
          status: st,
          note: "",
        });
      });

      await saveAttendance({ classId, date, records: mergedRecords });
      Alert.alert("✅", "Lưu điểm danh thành công");
      navigation.goBack();
    } catch (err) {
      Alert.alert("Lỗi", "Không thể lưu điểm danh.");
    } finally {
      setSaving(false);
    }
  };

  const renderStudent = ({ item }: any) => {
    const id = item._id;
    const choice = choices[id];

    return (
      <View style={styles.row}>
        <Image
          source={
            item.avatar
              ? { uri: item.avatar }
              : require("../assets/icons/student.png")
          }
          style={styles.avatar}
        />

        <View style={styles.nameCol}>
          <Text style={styles.name}>{item.name}</Text>
        </View>

        {/* Present */}
        <TouchableOpacity
          onPress={() => togglePresent(id)}
          style={[styles.checkbox, choice === "present" && styles.checkboxPresent]}
        >
          {choice === "present" && <Text style={styles.tick}>✓</Text>}
        </TouchableOpacity>

        {/* Absent */}
        <TouchableOpacity
          onPress={() => toggleAbsent(id)}
          style={[styles.checkbox, choice === "absent" && styles.checkboxAbsent]}
        >
          {choice === "absent" && <Text style={styles.tick}>✓</Text>}
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>
        Điểm danh — {session === "morning" ? "Buổi sáng" : "Buổi chiều"}
      </Text>
      <Text style={styles.date}>{date}</Text>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.presentBox}>
          <Text style={styles.statNum}>{presentCount}</Text>
          <Text style={styles.statLabel}>Present</Text>
        </View>

        <View style={styles.absentBox}>
          <Text style={styles.statNum}>{absentCount}</Text>
          <Text style={styles.statLabel}>Absent</Text>
        </View>
      </View>

      {/* Header Row */}
      <View style={styles.headerRow}>
  <Text style={[styles.headerText, { flex: 1.5 }]}>Student Name</Text>

  <Text
    style={[
      styles.headerText,
      { flex: 0.8, textAlign: "center", marginLeft: -4 }
    ]}
  >
    Present    Absent
  </Text>
</View>

      {/* List */}
      <FlatList
        data={students}
        keyExtractor={(i) => i._id}
        renderItem={renderStudent}
        contentContainerStyle={{ paddingBottom: 140 }}
      />

      {/* Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.btnOutline} onPress={() => navigation.goBack()}>
          <Text style={styles.btnOutlineText}>Hủy</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnSave} onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnSaveText}>Lưu</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0FFF7" },

  header: {
    fontSize: 20,
    fontWeight: "800",
    color: "#064E3B",
    paddingHorizontal: 16,
    marginTop: 10,
  },
  date: {
    color: "#065F46",
    paddingHorizontal: 16,
    marginBottom: 10,
  },

  stats: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  presentBox: {
    flex: 1,
    backgroundColor: "#C8F7D4",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginRight: 6,
  },
  absentBox: {
    flex: 1,
    backgroundColor: "#F8D0D0",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginLeft: 6,
  },
  statNum: {
    fontSize: 20,
    fontWeight: "800",
    color: "#064E3B",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },

  headerRow: {
    flexDirection: "row",
    backgroundColor: "#7873C0",
    paddingVertical: 8,
    marginHorizontal: 12,
    borderRadius: 6,
  },
  headerText: {
    color: "white",
    fontWeight: "700",
    paddingLeft: 10,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 12,
    backgroundColor: "#F5F6FA",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  avatar: { width: 42, height: 42, borderRadius: 21, marginRight: 14 },

  nameCol: { flex: 1 },
  name: {
    fontWeight: "700",
    fontSize: 15,
    color: "#064E3B",
  },

  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#6D6DC3",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
    marginLeft: 6,      
    marginRight: 20,    
    backgroundColor: "#fff",
    
  },
  checkboxPresent: {
    backgroundColor: "#4ADE80",
    borderColor: "#22C55E",
  },
  checkboxAbsent: {
    backgroundColor: "#EF4444",
    borderColor: "#B91C1C",
  },
  tick: { color: "#fff", fontWeight: "900", fontSize: 16 },

  footer: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  btnOutline: {
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    minWidth: 120,
    alignItems: "center",
  },
  btnOutlineText: { fontWeight: "700", color: "#064E3B" },

  btnSave: {
    backgroundColor: "#10B981",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    minWidth: 120,
    alignItems: "center",
  },
  btnSaveText: { fontWeight: "700", color: "#fff" },
});

// AttendanceStudentScreen.tsx
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
  Modal,
  TextInput,
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

interface StudentChoice {
  status?: "present" | "absent";
  note?: string;
}

export default function AttendanceStudentScreen({ route, navigation }: Props) {
  const { classId, date, session } = route.params;

  const [students, setStudents] = useState<any[]>([]);
  const [choices, setChoices] = useState<Record<string, StudentChoice>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);

  // modal state for note
  const [noteModal, setNoteModal] = useState({
    open: false,
    id: "",
    text: "",
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // students in class
        const sRes = await getStudentsByClass(classId);
        const list = sRes.data || [];
        setStudents(list);

        // initial map with empty StudentChoice
        const map: Record<string, StudentChoice> = {};
        list.forEach((s: any) => {
          map[s._id] = { status: undefined, note: "" };
        });

        // load existing attendance for date
        const attRes = await getAttendance(classId, date);
        const attData = attRes.data;

        if (attData && Array.isArray(attData.records)) {
          attData.records.forEach((r: any) => {
            const sid = r.student?._id || r.student;
            if (sid && r.session === session) {
              if (r.status === "present" || r.status === "absent") {
                map[sid] = { status: r.status, note: r.note || "" };
              }
            }
          });
        }

        setChoices(map);
        setInitialLoaded(true);
      } catch (err) {
        console.log("load error", err);
        Alert.alert("Lỗi", "Không thể tải dữ liệu điểm danh.");
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // toggle functions updated to work with StudentChoice
  const togglePresent = (id: string) =>
  setChoices((p) => ({
    ...p,
    [id]: {
      status: p[id]?.status === "present" ? undefined : "present",
      note: "",   // luôn xoá note khi present
    },
  }));

  const toggleAbsent = (id: string) =>
  setChoices((p) => ({
    ...p,
    [id]: {
      status: p[id]?.status === "absent" ? undefined : "absent",
      note: p[id]?.note ?? "", // giữ note nếu đã có
    },
  }));

  // counts: check .status property
  const presentCount = Object.values(choices).filter((c) => c.status === "present").length;
  const absentCount = Object.values(choices).filter((c) => c.status === "absent").length;

  const handleSave = async () => {
    setSaving(true);
    try {
      const existing = await getAttendance(classId, date);
      const existingDoc = existing.data;

      const mergedRecords: any[] = [];

      // keep other sessions' records
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

      // add current choices (only those with status)
      Object.keys(choices).forEach((sid) => {
        const st = choices[sid];
        if (!st || !st.status) return;
        mergedRecords.push({
          student: sid,
          session,
          status: st.status,
          note: st.note || "",
        });
      });

      await saveAttendance({ classId, date, records: mergedRecords });
      Alert.alert("✅", "Lưu điểm danh thành công");
      navigation.goBack();
    } catch (err) {
      console.log("save error", err);
      Alert.alert("Lỗi", "Không thể lưu điểm danh.");
    } finally {
      setSaving(false);
    }
  };

  const renderStudent = ({ item }: any) => {
    const id = item._id;
    const choice = choices[id] || { status: undefined, note: "" };

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
    style={[styles.checkbox, choice.status === "present" && styles.checkboxPresent]}
  >
    {choice.status === "present" && <Text style={styles.tick}>✓</Text>}
  </TouchableOpacity>

  {/* Absent */}
  <TouchableOpacity
    onPress={() => toggleAbsent(id)}
    style={[styles.checkbox, choice.status === "absent" && styles.checkboxAbsent]}
  >
    {choice.status === "absent" && <Text style={styles.tick}>✓</Text>}
  </TouchableOpacity>

  {/* Note */}
  <View style={{ width: 40, alignItems: "center" }}>
    {choice.status === "absent" && (
      <TouchableOpacity
        style={styles.noteBtn}
        onPress={() =>
          setNoteModal({ open: true, id, text: choice.note || "" })
        }
      >
        <Text style={styles.noteBtnText}>📝</Text>
      </TouchableOpacity>
    )}
  </View>
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
        <Text style={[styles.headerText, { flex: 1 }]}>Student Name</Text>
        <Text style={[styles.headerText, { flex: 0, textAlign: "center" }]}>Present</Text>
        <Text style={[styles.headerText, { flex: 0, textAlign: "center" }]}>Absent</Text>
        <Text style={[styles.headerText, { flex: 0, textAlign: "center" }]}>Note</Text>
      </View>

      {/* List */}
      <FlatList
        data={students}
        keyExtractor={(i) => i._id}
        renderItem={renderStudent}
        contentContainerStyle={{ paddingBottom: 140 }}
      />

      {/* Footer buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.btnOutline} onPress={() => navigation.goBack()}>
          <Text style={styles.btnOutlineText}>Hủy</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnSave} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnSaveText}>Lưu</Text>}
        </TouchableOpacity>
      </View>

      {/* Note Modal */}
      <Modal visible={noteModal.open} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Lý do vắng mặt</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Nhập lý do..."
              multiline
              value={noteModal.text}
              onChangeText={(t) => setNoteModal((p) => ({ ...p, text: t }))}
            />

            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setNoteModal({ open: false, id: "", text: "" })}
              >
                <Text>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSave}
                onPress={() => {
                  // save note to choices and ensure status is absent
                  setChoices((p) => ({
                    ...p,
                    [noteModal.id]: {
                      ...(p[noteModal.id] || {}),
                      status: "absent",
                      note: noteModal.text,
                    },
                  }));
                  setNoteModal({ open: false, id: "", text: "" });
                }}
              >
                <Text style={{ color: "#fff" }}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    width: 36,
    height: 36,
    borderWidth: 2,
    borderColor: "#6D6DC3",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 6,
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
  tick: { color: "#fff", fontWeight: "900", fontSize: 18 },

  noteBtn: {
  width: 28,
  height: 28,
  borderRadius: 6,
  borderWidth: 1,
  borderColor: "#CBD5E1",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#fff",
},
noteBtnText: {
  fontSize: 16,
},

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

  /* modal styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "86%",
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
    color: "#064E3B",
  },
  modalInput: {
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  modalBtns: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },
  modalCancel: {
    padding: 10,
  },
  modalSave: {
    backgroundColor: "#10B981",
    padding: 10,
    borderRadius: 8,
  },
});
